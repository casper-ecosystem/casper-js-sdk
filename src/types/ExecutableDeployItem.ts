import { jsonMember, jsonObject } from 'typedjson';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { concat } from '@ethersproject/bytes';

import { Args } from './Args';
import { CLTypeOption, CLTypeUInt64, CLValue, CLValueOption } from './clvalue';
import { ContractHash, URef } from './key';
import {
  byteArrayJsonDeserializer,
  byteArrayJsonSerializer,
  deserializeArgs,
  serializeArgs
} from './SerializationUtils';
import { PublicKey } from './keypair';

/**
 * Enum representing the different types of executable deploy items.
 */
enum ExecutableDeployItemType {
  ModuleBytes,
  StoredContractByHash,
  StoredContractByName,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  Transfer
}

/**
 * Represents a deploy item containing module bytes and associated arguments.
 */
@jsonObject
export class ModuleBytes {
  /**
   * The module bytes in hexadecimal format.
   */
  @jsonMember({
    name: 'module_bytes',
    constructor: Uint8Array,
    serializer: (bytes: Uint8Array) => byteArrayJsonSerializer(bytes),
    deserializer: byteArrayJsonDeserializer
  })
  moduleBytes!: Uint8Array;

  /**
   * The arguments passed to the module.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * Constructs a `ModuleBytes` instance with module bytes and arguments.
   * @param moduleBytes The module bytes in hexadecimal format.
   * @param args The arguments for the module.
   */
  constructor(moduleBytes: Uint8Array, args: Args) {
    this.moduleBytes = moduleBytes;
    this.args = args;
  }

  /**
   * Serializes the `ModuleBytes` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    const lengthBytes = CLValue.newCLUInt32(
      BigNumber.from(this.moduleBytes.length)
    ).bytes();
    const bytesArrayBytes = CLValue.newCLByteArray(this.moduleBytes).bytes();

    let result = concat([lengthBytes, bytesArrayBytes]);

    if (this.args) {
      const argBytes = this.args.toBytes();
      result = concat([result, argBytes]);
    }

    return result;
  }
}

/**
 * Represents a deploy item with a stored contract referenced by its hash.
 */
@jsonObject
export class StoredContractByHash {
  /**
   * The hash of the stored contract.
   */
  @jsonMember({
    name: 'hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  hash: ContractHash;

  /**
   * The entry point of the contract to invoke.
   */
  @jsonMember({ name: 'entry_point', constructor: String })
  entryPoint: string;

  /**
   * The arguments for the contract call.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * Constructs a `StoredContractByHash` instance with the contract hash, entry point, and arguments.
   * @param hash The contract hash.
   * @param entryPoint The contract entry point.
   * @param args The arguments for the contract.
   */
  constructor(hash: ContractHash, entryPoint: string, args: Args) {
    this.hash = hash;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  /**
   * Serializes the `StoredContractByHash` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    const hashBytes = this.hash.hash.toBytes();
    const entryPointBytes = CLValue.newCLString(this.entryPoint).bytes();
    const argBytes = this.args.toBytes();

    return concat([hashBytes, entryPointBytes, argBytes]);
  }
}

/**
 * Represents a deploy item with a stored contract referenced by its name.
 */
@jsonObject
export class StoredContractByName {
  /**
   * The name of the stored contract.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The entry point of the contract to invoke.
   */
  @jsonMember({ name: 'entry_point', constructor: String })
  entryPoint: string;

  /**
   * The arguments for the contract call.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * Constructs a `StoredContractByName` instance with the contract name, entry point, and arguments.
   * @param name The contract name.
   * @param entryPoint The contract entry point.
   * @param args The arguments for the contract.
   */
  constructor(name: string, entryPoint: string, args: Args) {
    this.name = name;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  /**
   * Serializes the `StoredContractByName` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    const nameBytes = CLValue.newCLString(this.name).bytes();
    const entryPointBytes = CLValue.newCLString(this.entryPoint).bytes();
    const argBytes = this.args.toBytes();

    return concat([nameBytes, entryPointBytes, argBytes]);
  }
}

/**
 * Represents a deploy item with a stored versioned contract referenced by its hash.
 */
@jsonObject
export class StoredVersionedContractByHash {
  /**
   * The hash of the stored contract.
   */
  @jsonMember({
    name: 'hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  hash: ContractHash;

  /**
   * The entry point of the contract to invoke.
   */
  @jsonMember({ name: 'entry_point', constructor: String })
  entryPoint: string;

  /**
   * The arguments for the contract call.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * The version of the contract.
   */
  @jsonMember({ name: 'version', constructor: Number })
  version?: number;

  /**
   * Constructs a `StoredVersionedContractByHash` instance with the contract hash, entry point, arguments, and version.
   * @param hash The contract hash.
   * @param entryPoint The contract entry point.
   * @param args The arguments for the contract.
   * @param version The contract version.
   */
  constructor(
    hash: ContractHash,
    entryPoint: string,
    args: Args,
    version?: number
  ) {
    this.hash = hash;
    this.entryPoint = entryPoint;
    this.version = version;
    this.args = args;
  }

  /**
   * Serializes the `StoredVersionedContractByHash` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    const hashBytes = this.hash.hash.toBytes();
    const optionBytes = new CLValueOption(
      this.version ? CLValue.newCLUInt32(BigNumber.from(this.version)) : null
    ).bytes();
    const entryPointBytes = CLValue.newCLString(this.entryPoint).bytes();
    const argBytes = this.args?.toBytes() || new Uint8Array();

    return concat([hashBytes, optionBytes, entryPointBytes, argBytes]);
  }
}

/**
 * Represents a deploy item with a stored versioned contract referenced by its name.
 */
@jsonObject
export class StoredVersionedContractByName {
  /**
   * The name of the stored contract.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The entry point of the contract to invoke.
   */
  @jsonMember({ name: 'entry_point', constructor: String })
  entryPoint: string;

  /**
   * The version of the contract.
   */
  @jsonMember({ name: 'version', constructor: Number })
  version?: number;

  /**
   * The arguments for the contract call.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * Constructs a `StoredVersionedContractByName` instance with the contract name, entry point, arguments, and version.
   * @param name The contract name.
   * @param entryPoint The contract entry point.
   * @param args The arguments for the contract.
   * @param version The contract version.
   */
  constructor(name: string, entryPoint: string, args: Args, version?: number) {
    this.name = name;
    this.entryPoint = entryPoint;
    this.version = version;
    this.args = args;
  }

  /**
   * Serializes the `StoredVersionedContractByName` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    const nameBytes = CLValue.newCLString(this.name).bytes();
    const optionBytes = new CLValueOption(
      this.version ? CLValue.newCLUInt32(BigNumber.from(this.version)) : null
    ).bytes();
    const entryPointBytes = CLValue.newCLString(this.entryPoint).bytes();
    const argBytes = this.args?.toBytes() || new Uint8Array();

    return concat([nameBytes, optionBytes, entryPointBytes, argBytes]);
  }
}

/**
 * Represents a deploy item with a transfer of funds and associated arguments.
 */
@jsonObject
export class TransferDeployItem {
  /**
   * The arguments for the transfer.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  args: Args;

  /**
   * Constructs a `TransferDeployItem` instance with arguments.
   * @param args The arguments for the transfer.
   */
  constructor(args: Args) {
    this.args = args;
  }

  /**
   * Creates a new transfer deploy item with the specified amount, target, source purse, and transfer ID.
   * @param amount The amount to transfer.
   * @param target The target address (either a URef or a PublicKey).
   * @param sourcePurse The source purse (optional).
   * @param id The transfer ID.
   * @returns A new `TransferDeployItem` instance.
   * @throws Error if the target is not specified or the transfer ID is missing.
   */
  public static newTransfer(
    amount: BigNumber | string,
    target: URef | PublicKey,
    sourcePurse: URef | null = null,
    id?: BigNumberish
  ): TransferDeployItem {
    const runtimeArgs = Args.fromMap({});
    runtimeArgs.insert('amount', CLValue.newCLUInt512(amount));
    if (sourcePurse) {
      runtimeArgs.insert('source', CLValue.newCLUref(sourcePurse));
    }
    if (target instanceof URef) {
      runtimeArgs.insert('target', CLValue.newCLUref(target));
    } else if (target instanceof PublicKey) {
      runtimeArgs.insert('target', CLValue.newCLPublicKey(target));
    } else {
      throw new Error('Please specify target');
    }

    const optionType = new CLTypeOption(CLTypeUInt64);
    const defaultClValue = new CLValue(optionType);
    defaultClValue.option = new CLValueOption(null, optionType);

    runtimeArgs.insert(
      'id',
      id ? CLValue.newCLOption(CLValue.newCLUint64(id)) : defaultClValue
    );

    return new TransferDeployItem(runtimeArgs);
  }

  /**
   * Serializes the `TransferDeployItem` instance to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    return this.args.toBytes();
  }
}

/**
 * Represents an executable deploy item, which can be one of several types such as `ModuleBytes`, `StoredContractByHash`, etc.
 */
@jsonObject
export class ExecutableDeployItem {
  /**
   * A module bytes deploy item.
   */
  @jsonMember({ name: 'ModuleBytes', constructor: ModuleBytes })
  moduleBytes?: ModuleBytes;

  /**
   * A stored contract deploy item referenced by hash.
   */
  @jsonMember({
    name: 'StoredContractByHash',
    constructor: StoredContractByHash
  })
  storedContractByHash?: StoredContractByHash;

  /**
   * A stored contract deploy item referenced by name.
   */
  @jsonMember({
    name: 'StoredContractByName',
    constructor: StoredContractByName
  })
  storedContractByName?: StoredContractByName;

  /**
   * A stored versioned contract deploy item referenced by hash.
   */
  @jsonMember({
    name: 'StoredVersionedContractByHash',
    constructor: StoredVersionedContractByHash
  })
  storedVersionedContractByHash?: StoredVersionedContractByHash;

  /**
   * A stored versioned contract deploy item referenced by name.
   */
  @jsonMember({
    name: 'StoredVersionedContractByName',
    constructor: StoredVersionedContractByName
  })
  storedVersionedContractByName?: StoredVersionedContractByName;

  /**
   * A transfer deploy item.
   */
  @jsonMember({ name: 'Transfer', constructor: TransferDeployItem })
  transfer?: TransferDeployItem;

  /**
   * Retrieves an argument by name from the deploy item.
   * @param name The name of the argument.
   * @returns The argument value, or `undefined` if not found.
   */
  public getArgByName(name: string): CLValue | undefined {
    const deployItemArgs = this.getArgs();
    return deployItemArgs.args.get(name);
  }

  /**
   * Sets an argument by name for the deploy item.
   * @param name The name of the argument.
   * @param value The value of the argument.
   */
  public setArg(name: string, value: CLValue) {
    const deployItemArgs = this.getArgs();
    deployItemArgs.insert(name, value);
  }

  /**
   * Retrieves the arguments for the deploy item.
   * @returns The arguments for the deploy item.
   */
  getArgs(): Args {
    if (this.moduleBytes) return this.moduleBytes.args;
    if (this.storedContractByHash) return this.storedContractByHash.args;
    if (this.storedContractByName) return this.storedContractByName.args;
    if (this.storedVersionedContractByHash)
      return this.storedVersionedContractByHash.args;
    if (this.storedVersionedContractByName)
      return this.storedVersionedContractByName.args;
    if (this.transfer) return this.transfer.args;
    throw new Error('failed to serialize ExecutableDeployItemJsonWrapper');
  }

  /**
   * Serializes the `ExecutableDeployItem` to a byte array.
   * @returns The serialized byte array.
   */
  bytes(): Uint8Array {
    let bytes: Uint8Array;

    if (this.moduleBytes) {
      bytes = this.moduleBytes.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.ModuleBytes),
        bytes
      ]);
    } else if (this.storedContractByHash) {
      bytes = this.storedContractByHash.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredContractByHash),
        bytes
      ]);
    } else if (this.storedContractByName) {
      bytes = this.storedContractByName.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredContractByName),
        bytes
      ]);
    } else if (this.storedVersionedContractByHash) {
      bytes = this.storedVersionedContractByHash.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredVersionedContractByHash),
        bytes
      ]);
    } else if (this.storedVersionedContractByName) {
      bytes = this.storedVersionedContractByName.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredVersionedContractByName),
        bytes
      ]);
    } else if (this.transfer) {
      bytes = this.transfer.bytes();
      return concat([Uint8Array.of(ExecutableDeployItemType.Transfer), bytes]);
    }

    return new Uint8Array();
  }

  /**
   * Creates a standard payment `ExecutableDeployItem` with the specified amount.
   * @param amount The amount to be transferred.
   * @returns A new `ExecutableDeployItem` instance with the payment.
   */
  public static standardPayment(
    amount: BigNumber | string
  ): ExecutableDeployItem {
    const executableDeployItem = new ExecutableDeployItem();
    executableDeployItem.moduleBytes = new ModuleBytes(
      Uint8Array.from([]),
      Args.fromMap({ amount: CLValue.newCLUInt512(amount) })
    );
    return executableDeployItem;
  }

  /**
   * Casts the `ExecutableDeployItem` to `ModuleBytes` if possible.
   * @returns The `ModuleBytes` representation of the `ExecutableDeployItem`, or `undefined` if not possible.
   */
  public asModuleBytes(): ModuleBytes | undefined {
    return this.moduleBytes;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `Transfer`.
   * @returns `true` if the `ExecutableDeployItem` is a transfer item, `false` otherwise.
   */
  public isTransfer() {
    return !!this.transfer;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `StoredVersionedContractByHash`.
   * @returns `true` if the `ExecutableDeployItem` is a stored versioned contract by hash, `false` otherwise.
   */
  public isStoredVersionContractByHash(): boolean {
    return !!this.storedVersionedContractByHash;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `StoredVersionedContractByName`.
   * @returns `true` if the `ExecutableDeployItem` is a stored versioned contract by name, `false` otherwise.
   */
  public isStoredVersionContractByName(): boolean {
    return !!this.storedVersionedContractByName;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `StoredContractByName`.
   * @returns `true` if the `ExecutableDeployItem` is a stored contract by name, `false` otherwise.
   */
  public isStoredContractByName(): boolean {
    return !!this.storedContractByName;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `StoredContractByHash`.
   * @returns `true` if the `ExecutableDeployItem` is a stored contract by hash, `false` otherwise.
   */
  public isStoredContractByHash(): boolean {
    return !!this.storedContractByHash;
  }

  /**
   * Checks if the `ExecutableDeployItem` is of type `ModuleBytes`.
   * @returns `true` if the `ExecutableDeployItem` is of type `ModuleBytes`, `false` otherwise.
   */
  public isModuleBytes(): boolean {
    return !!this.moduleBytes;
  }

  /**
   * Creates a new `ModuleBytes` object from a `Uint8Array` of module bytes and a set of `RuntimeArgs`
   * @param moduleBytes A set of module bytes as a `Uint8Array`
   * @param args The runtime arguments for the new `ModuleBytes` object
   * @returns A new `ExecutableDeployItem` created from a new `ModuleBytes` object built using `moduleBytes` and `args`
   */
  public static newModuleBytes(
    moduleBytes: Uint8Array,
    args: Args
  ): ExecutableDeployItem {
    const executableDeployItem = new ExecutableDeployItem();
    executableDeployItem.moduleBytes = new ModuleBytes(moduleBytes, args);

    return executableDeployItem;
  }
}
