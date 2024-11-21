import isNull from 'lodash/isNull';
import { BigNumber } from '@ethersproject/bignumber';

import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { TransactionRuntime } from './AddressableEntity';
import { Hash } from './key';
import {
  CLTypeOption,
  CLTypeUInt32,
  CLValueBool,
  CLValueOption,
  CLValueString,
  CLValueUInt32,
  CLValueUInt64
} from './clvalue';
import { ExecutableDeployItem } from './ExecutableDeployItem';
import { CalltableSerialization } from './CalltableSerialization';
import {
  byteArrayJsonDeserializer,
  byteArrayJsonSerializer
} from './SerializationUtils';

/**
 * Represents the invocation target for a transaction identified by a package hash.
 */
@jsonObject
export class ByPackageHashInvocationTarget {
  /**
   * The address of the package in the form of a hash.
   */
  @jsonMember({
    name: 'addr',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  addr: Hash;

  /**
   * The version of the package, if specified.
   */
  @jsonMember({ name: 'version', isRequired: false, constructor: Number })
  version?: number;

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();

    const versionBytes = this.version
      ? CLValueOption.newCLOption(
          CLValueUInt32.newCLUInt32(BigNumber.from(this.version))
        ).bytes()
      : new CLValueOption(null, new CLTypeOption(CLTypeUInt32)).bytes();

    calltableSerialization.addField(0, Uint8Array.of(2));
    calltableSerialization.addField(1, this.addr.toBytes());
    calltableSerialization.addField(2, versionBytes);

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents the invocation target for a transaction identified by a package name.
 */
@jsonObject
export class ByPackageNameInvocationTarget {
  /**
   * The name of the package.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The version of the package, if specified.
   */
  @jsonMember({ name: 'version', isRequired: false, constructor: Number })
  version?: number;

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();

    const versionBytes = this.version
      ? CLValueOption.newCLOption(
          CLValueUInt32.newCLUInt32(BigNumber.from(this.version))
        ).bytes()
      : new CLValueOption(null, new CLTypeOption(CLTypeUInt32)).bytes();

    calltableSerialization.addField(0, Uint8Array.of(3));
    calltableSerialization.addField(
      1,
      CLValueString.newCLString(this.name).bytes()
    );
    calltableSerialization.addField(2, versionBytes);

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents a transaction invocation target, which can be one of the following:
 * - By hash
 * - By name
 * - By package hash
 * - By package name
 */
@jsonObject
export class TransactionInvocationTarget {
  /**
   * Invocation target by hash, if specified.
   */
  @jsonMember({
    name: 'ByHash',
    isRequired: false,
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  byHash?: Hash;

  /**
   * Invocation target by name, if specified.
   */
  @jsonMember({ name: 'ByName', isRequired: false, constructor: String })
  byName?: string;

  /**
   * Invocation target by package hash, if specified.
   */
  @jsonMember({
    name: 'ByPackageHash',
    isRequired: false,
    constructor: ByPackageHashInvocationTarget
  })
  byPackageHash?: ByPackageHashInvocationTarget;

  /**
   * Invocation target by package name, if specified.
   */
  @jsonMember({
    name: 'ByPackageName',
    isRequired: false,
    constructor: ByPackageNameInvocationTarget
  })
  byPackageName?: ByPackageNameInvocationTarget;

  public toBytes(): Uint8Array {
    if (this.byHash) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(0));
      calltableSerializer.addField(1, this.byHash.toBytes());
      return calltableSerializer.toBytes();
    } else if (this.byName) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(1));
      calltableSerializer.addField(
        1,
        CLValueString.newCLString(this.byName).bytes()
      );
      return calltableSerializer.toBytes();
    } else if (this.byPackageHash) {
      return this.byPackageHash.toBytes();
    } else if (this.byPackageName) {
      return this.byPackageName.toBytes();
    }

    throw new Error(
      'Can not convert TransactionInvocationTarget to bytes. Missing values from initialization'
    );
  }
}

/**
 * Represents a stored target, which includes both the invocation target and runtime.
 */
@jsonObject
export class StoredTarget {
  /**
   * The invocation target for the stored transaction.
   */
  @jsonMember({ name: 'id', constructor: TransactionInvocationTarget })
  id: TransactionInvocationTarget;

  /**
   * The runtime associated with the stored transaction.
   */
  @jsonMember({ name: 'runtime', constructor: String })
  runtime: TransactionRuntime;

  /**
   * The runtime associated with the stored transaction.
   */
  @jsonMember({ name: 'transferred_value', constructor: Number })
  transferredValue: number;

  public toBytes() {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, Uint8Array.of(1));
    calltableSerializer.addField(1, this.id.toBytes());
    calltableSerializer.addField(
      2,
      CLValueString.newCLString(this.runtime).bytes()
    );
    calltableSerializer.addField(
      3,
      CLValueUInt64.newCLUint64(this.transferredValue).bytes()
    );

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents a session target, which includes both the module bytes and runtime.
 */
@jsonObject
export class SessionTarget {
  /**
   * The module bytes associated with the session target.
   */
  @jsonMember({
    name: 'module_bytes',
    constructor: Uint8Array,
    deserializer: byteArrayJsonDeserializer,
    serializer: byteArrayJsonSerializer
  })
  moduleBytes: Uint8Array;

  /**
   * The runtime associated with the session target.
   */
  @jsonMember({ name: 'runtime', constructor: String })
  runtime: TransactionRuntime;

  /**
   * The runtime associated with the session target.
   */
  @jsonMember({ name: 'is_install_upgrade', constructor: Boolean })
  isInstallUpgrade: boolean;

  /**
   * The runtime associated with the stored transaction.
   */
  @jsonMember({ name: 'transferred_value', constructor: Number })
  transferredValue: number;

  /**
   * The runtime associated with the stored transaction.
   */
  @jsonMember({
    name: 'seed',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  seed: Hash;

  public toBytes(): Uint8Array {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, Uint8Array.of(2));
    calltableSerializer.addField(
      1,
      CLValueBool.fromBoolean(this.isInstallUpgrade).bytes()
    );
    calltableSerializer.addField(
      2,
      CLValueString.newCLString(this.runtime).bytes()
    );
    calltableSerializer.addField(3, this.moduleBytes);
    calltableSerializer.addField(
      4,
      CLValueUInt64.newCLUint64(this.transferredValue).bytes()
    );
    calltableSerializer.addField(5, this.seed.toBytes());

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents a transaction target, which could be one of the following types:
 * - Native (no specific target)
 * - Stored (contract or stored item target)
 * - Session (session-based target)
 */
@jsonObject
export class TransactionTarget {
  /**
   * Native transaction target, representing a transaction with no specific target.
   */
  @jsonMember({ constructor: Object, name: 'Native' })
  native?: object;

  /**
   * Stored transaction target, representing a transaction that targets a stored contract or item.
   */
  @jsonMember({ name: 'Stored', constructor: StoredTarget })
  stored?: StoredTarget;

  /**
   * Session transaction target, representing a session-based transaction.
   */
  @jsonMember({ name: 'Session', constructor: SessionTarget })
  session?: SessionTarget;

  /**
   * Constructs a `TransactionTarget` instance with the specified values for native, stored, or session targets.
   *
   * @param native The native transaction target, if applicable.
   * @param stored The stored transaction target, if applicable.
   * @param session The session transaction target, if applicable.
   */
  constructor(native?: object, stored?: StoredTarget, session?: SessionTarget) {
    this.native = native;
    this.stored = stored;
    this.session = session;
  }

  /**
   * Serializes the `TransactionTarget` into a byte array.
   *
   * @returns A `Uint8Array` representing the serialized transaction target.
   */
  toBytes(): Uint8Array {
    if (this.native) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(0));

      return calltableSerializer.toBytes();
    } else if (this.stored) {
      return this.stored.toBytes();
    } else if (this.session) {
      return this.session.toBytes();
    }

    throw new Error(
      'Can not convert TransactionTarget to bytes. Missing values ( native | stored | session ) from initialization'
    );
  }

  /**
   * Deserializes a `TransactionTarget` from a JSON object.
   *
   * @param json The JSON object to deserialize.
   * @returns A `TransactionTarget` instance.
   * @throws Error if the JSON object format is invalid.
   */
  static fromJSON(json: any): TransactionTarget {
    const target = new TransactionTarget();

    if (typeof json === 'string' && json === 'Native') {
      target.native = {};
    } else if (json.Stored) {
      const serializer = new TypedJSON(StoredTarget);
      target.stored = serializer.parse(json.Stored);
    } else if (json.Session) {
      const serializer = new TypedJSON(SessionTarget);
      target.session = serializer.parse(json.Session);
    }

    return target;
  }

  /**
   * Converts the `TransactionTarget` into a JSON-compatible format.
   *
   * @returns The JSON representation of the `TransactionTarget`.
   * @throws Error if the target type is unknown.
   */
  toJSON(): any {
    if (this.native !== undefined) {
      return 'Native';
    } else if (this.stored !== undefined) {
      const serializer = new TypedJSON(StoredTarget);
      return serializer.toPlainJson(this.stored);
    } else if (this.session !== undefined) {
      const serializer = new TypedJSON(SessionTarget);
      return serializer.toPlainJson(this.session);
    } else {
      throw new Error('unknown target type');
    }
  }

  /**
   * Creates a new `TransactionTarget` from a session-based transaction.
   *
   * @param session The `ExecutableDeployItem` that defines the session-based transaction.
   * @returns A new `TransactionTarget` instance derived from the session.
   */
  public static newTransactionTargetFromSession(
    session: ExecutableDeployItem
  ): TransactionTarget {
    const transactionTarget = new TransactionTarget();
    if (session.transfer !== undefined) {
      transactionTarget.native = {};
      return transactionTarget;
    }

    if (session.moduleBytes !== undefined) {
      const sessionTarget = new SessionTarget();
      sessionTarget.moduleBytes = session.moduleBytes.moduleBytes;
      sessionTarget.runtime = 'VmCasperV1';

      transactionTarget.session = sessionTarget;
      return transactionTarget;
    }

    if (session.storedContractByHash !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byHash = session.storedContractByHash.hash.hash;
      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;
      return transactionTarget;
    }

    if (session.storedContractByName !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byName = session.storedContractByName.name;

      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    if (session.storedVersionedContractByHash !== undefined) {
      let version: number | undefined;
      if (
        session.storedVersionedContractByHash.version !== undefined &&
        !isNull(session.storedVersionedContractByHash.version)
      ) {
        const versionNum = parseInt(
          session.storedVersionedContractByHash.version.toString(),
          10
        );
        if (!isNaN(versionNum)) {
          version = versionNum;
        }
      }

      const packageHashInvocationTarget = new ByPackageHashInvocationTarget();
      packageHashInvocationTarget.addr =
        session.storedVersionedContractByHash.hash.hash;
      packageHashInvocationTarget.version = version;

      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byPackageHash = packageHashInvocationTarget;

      const storedTarget = new StoredTarget();
      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    if (session.storedVersionedContractByName !== undefined) {
      let version: number | undefined;
      if (
        session.storedVersionedContractByName.version !== undefined &&
        !isNull(session.storedVersionedContractByName.version)
      ) {
        const versionNum = parseInt(
          session.storedVersionedContractByName.version.toString(),
          10
        );
        if (!isNaN(versionNum)) {
          version = versionNum;
        }
      }

      const packageNameInvocationTarget = new ByPackageNameInvocationTarget();
      packageNameInvocationTarget.name =
        session.storedVersionedContractByName.name;
      packageNameInvocationTarget.version = version;

      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byPackageName = packageNameInvocationTarget;

      const storedTarget = new StoredTarget();
      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    return new TransactionTarget();
  }
}
