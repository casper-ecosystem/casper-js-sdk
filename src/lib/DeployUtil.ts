/**
 * Util methods for making Deploy message
 *
 * @packageDocumentation
 */
import { concat } from '@ethersproject/bytes';
import blake from 'blakejs';
import { Option } from './option';
import { decodeBase16, encodeBase16 } from './Conversions';
import humanizeDuration from 'humanize-duration';
import {
  CLTypedAndToBytesHelper,
  CLTypeHelper,
  CLValue,
  PublicKey,
  ToBytes,
  U32
} from './CLValue';
import {
  toBytesArrayU8,
  toBytesBytesArray,
  toBytesDeployHash,
  toBytesString,
  toBytesU64,
  toBytesVecT,
  toBytesU32
} from './byterepr';
import { RuntimeArgs } from './RuntimeArgs';
// import JSBI from 'jsbi';
import { DeployUtil, Keys, URef } from './index';
import { AsymmetricKey, SignatureAlgorithm } from './Keys';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { ByteArray } from 'tweetnacl-ts';
import { Result, Ok, Err } from 'ts-results';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  spacer: '',
  serialComma: false,
  conjunction: ' ',
  delimiter: ' ',
  language: 'shortEn',
  languages: {
    // https://docs.rs/humantime/2.0.1/humantime/fn.parse_duration.html
    shortEn: {
      d: () => 'day',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms'
    }
  }
});

const byteArrayJsonSerializer: (bytes: Uint8Array) => string = (
  bytes: Uint8Array
) => {
  return encodeBase16(bytes);
};

const byteArrayJsonDeserializer: (str: string) => Uint8Array = (
  str: string
) => {
  return decodeBase16(str);
};

/**
 * Returns a humanizer duration
 * @param ttl in milliseconds
 */
export const humanizerTTL = (ttl: number) => {
  return shortEnglishHumanizer(ttl);
};

/**
 * Returns duration in ms
 * @param ttl in humanized string
 */
export const dehumanizerTTL = (ttl: string): number => {
  const dehumanizeUnit = (s: string): number => {
    if (s.includes('ms')) {
      return Number(s.replace('ms', ''));
    }
    if (s.includes('s') && !s.includes('m')) {
      return Number(s.replace('s', '')) * 1000;
    }
    if (s.includes('m') && !s.includes('s')) {
      return Number(s.replace('m', '')) * 60 * 1000;
    }
    if (s.includes('h')) {
      return Number(s.replace('h', '')) * 60 * 60 * 1000;
    }
    if (s.includes('day')) {
      return Number(s.replace('day', '')) * 24 * 60 * 60 * 1000;
    }
    throw Error('Unsuported TTL unit');
  };

  return ttl
    .split(' ')
    .map(dehumanizeUnit)
    .reduce((acc, val) => (acc += val));
};

export class UniqAddress {
  publicKey: PublicKey;
  transferId: BigNumber;

  /**
  * Constructs UniqAddress
  * @param publicKey PublicKey instance
  * @param transferId BigNumberish value (can be also string representing number). Max U64.
  */
  constructor(publicKey: PublicKey, transferId: BigNumberish) {
    if (!(publicKey instanceof PublicKey)) {
      throw new Error('publicKey is not an instance of PublicKey');
    }
    const bigNum = BigNumber.from(transferId);
    if (bigNum.gt('18446744073709551615')) {
      throw new Error('transferId max value is U64');
    }
    this.transferId = bigNum;
    this.publicKey = publicKey;
  }

  /**
  * Returns string in format "accountHex-transferIdHex"
  * @param ttl in humanized string
  */
  toString(): string {
    return `${this.publicKey.toAccountHex()}-${this.transferId.toHexString()}`;
  }

  /**
  * Builds UniqAddress from string 
  * @param value value returned from UniqAddress.toString()
  */
  static fromString(value: string): UniqAddress {
    const [accountHex, transferHex] = value.split('-');
    const publicKey = PublicKey.fromHex(accountHex);
    return new UniqAddress(publicKey, transferHex);
  }
}

@jsonObject
export class DeployHeader implements ToBytes {
  @jsonMember({
    serializer: (account: PublicKey) => {
      return account.toAccountHex();
    },
    deserializer: (hexStr: string) => {
      return PublicKey.fromHex(hexStr);
    }
  })
  public account: PublicKey;

  @jsonMember({
    serializer: (n: number) => new Date(n).toISOString(),
    deserializer: (s: string) => Date.parse(s)
  })
  public timestamp: number;

  @jsonMember({
    serializer: humanizerTTL,
    deserializer: dehumanizerTTL
  })
  public ttl: number;

  @jsonMember({ constructor: Number, name: 'gas_price' })
  public gasPrice: number;

  @jsonMember({
    name: 'body_hash',
    serializer: byteArrayJsonSerializer,
    deserializer: byteArrayJsonDeserializer
  })
  public bodyHash: Uint8Array;

  @jsonArrayMember(ByteArray, {
    serializer: (value: Uint8Array[]) =>
      value.map(it => byteArrayJsonSerializer(it)),
    deserializer: (json: any) =>
      json.map((it: string) => byteArrayJsonDeserializer(it))
  })
  public dependencies: Uint8Array[];

  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * The header portion of a Deploy
   *
   * @param account The account within which the deploy will be run.
   * @param timestamp When the deploy was created.
   * @param ttl How long the deploy will stay valid.
   * @param gasPrice Price per gas unit for this deploy.
   * @param bodyHash  Hash of the Wasm code.
   * @param dependencies Other deploys that have to be run before this one.
   * @param chainName Which chain the deploy is supposed to be run on.
   */
  constructor(
    account: PublicKey,
    timestamp: number,
    ttl: number,
    gasPrice: number,
    bodyHash: Uint8Array,
    dependencies: Uint8Array[],
    chainName: string
  ) {
    this.account = account;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.gasPrice = gasPrice;
    this.bodyHash = bodyHash;
    this.dependencies = dependencies;
    this.chainName = chainName;
  }

  public toBytes(): Uint8Array {
    return concat([
      this.account.toBytes(),
      toBytesU64(this.timestamp),
      toBytesU64(this.ttl),
      toBytesU64(this.gasPrice),
      toBytesDeployHash(this.bodyHash),
      toBytesVecT(this.dependencies.map(d => new DeployHash(d))),
      toBytesString(this.chainName)
    ]);
  }
}

/**
 * The cryptographic hash of a Deploy.
 */
class DeployHash implements ToBytes {
  constructor(private hash: Uint8Array) {}

  public toBytes(): Uint8Array {
    return toBytesDeployHash(this.hash);
  }
}

export interface DeployJson {
  session: Record<string, any>;
  approvals: { signature: string; signer: string }[];
  header: DeployHeader;
  payment: Record<string, any>;
  hash: string;
}

/**
 * A struct containing a signature and the public key of the signer.
 */
@jsonObject
export class Approval {
  @jsonMember({ constructor: String })
  public signer: string;
  @jsonMember({ constructor: String })
  public signature: string;
}

abstract class ExecutableDeployItemInternal implements ToBytes {
  public abstract tag: number;

  public abstract args: RuntimeArgs;

  public abstract toBytes(): Uint8Array;

  public getArgByName(name: string): CLValue | undefined {
    return this.args.args.get(name);
  }

  public setArg(name: string, value: CLValue) {
    this.args.args.set(name, value);
  }
}

const desRA = (arr: any) => {
  const raSerializer = new TypedJSON(RuntimeArgs);
  const value = {
    args: arr
  };
  return raSerializer.parse(value);
};

const serRA = (ra: RuntimeArgs) => {
  const raSerializer = new TypedJSON(RuntimeArgs);
  const json = raSerializer.toPlainJson(ra);
  return Object.values(json as any)[0];
};

@jsonObject
export class ModuleBytes extends ExecutableDeployItemInternal {
  public tag = 0;

  @jsonMember({
    name: 'module_bytes',
    serializer: byteArrayJsonSerializer,
    deserializer: byteArrayJsonDeserializer
  })
  public moduleBytes: Uint8Array;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  constructor(moduleBytes: Uint8Array, args: RuntimeArgs) {
    super();

    this.moduleBytes = moduleBytes;
    this.args = args;
  }

  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      toBytesArrayU8(this.moduleBytes),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class StoredContractByHash extends ExecutableDeployItemInternal {
  public tag = 1;

  @jsonMember({
    serializer: byteArrayJsonSerializer,
    deserializer: byteArrayJsonDeserializer
  })
  public hash: Uint8Array;

  @jsonMember({
    name: 'entry_point',
    constructor: String
  })
  public entryPoint: string;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  constructor(hash: Uint8Array, entryPoint: string, args: RuntimeArgs) {
    super();

    this.entryPoint = entryPoint;
    this.args = args;
    this.hash = hash;
  }

  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      toBytesBytesArray(this.hash),
      toBytesString(this.entryPoint),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class StoredContractByName extends ExecutableDeployItemInternal {
  public tag = 2;

  @jsonMember({ constructor: String })
  public name: string;

  @jsonMember({
    name: 'entry_point',
    constructor: String
  })
  public entryPoint: string;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  constructor(name: string, entryPoint: string, args: RuntimeArgs) {
    super();

    this.name = name;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      toBytesString(this.name),
      toBytesString(this.entryPoint),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class StoredVersionedContractByName extends ExecutableDeployItemInternal {
  public tag = 4;

  @jsonMember({ constructor: String })
  public name: string;

  @jsonMember({ constructor: Number, preserveNull: true })
  public version: number | null;

  @jsonMember({ name: 'entry_point', constructor: String })
  public entryPoint: string;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  constructor(
    name: string,
    version: number | null,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    super();
    this.name = name;
    this.version = version;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  public toBytes(): Uint8Array {
    let serializedVersion;
    if (this.version === null) {
      serializedVersion = new Option(null, CLTypeHelper.u32());
    } else {
      serializedVersion = new Option(new U32(this.version as number));
    }
    return concat([
      Uint8Array.from([this.tag]),
      toBytesString(this.name),
      serializedVersion.toBytes(),
      toBytesString(this.entryPoint),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class StoredVersionedContractByHash extends ExecutableDeployItemInternal {
  public tag = 3;

  @jsonMember({
    serializer: byteArrayJsonSerializer,
    deserializer: byteArrayJsonDeserializer
  })
  public hash: Uint8Array;

  @jsonMember({
    constructor: Number,
    preserveNull: true
  })
  public version: number | null;

  @jsonMember({
    name: 'entry_point',
    constructor: String
  })
  public entryPoint: string;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  constructor(
    hash: Uint8Array,
    version: number | null,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    super();
    this.hash = hash;
    this.version = version;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  public toBytes(): Uint8Array {
    let serializedVersion;

    if (this.version === null) {
      serializedVersion = new Option(null, CLTypeHelper.u32());
    } else {
      serializedVersion = new Option(new U32(this.version as number));
    }
    return concat([
      Uint8Array.from([this.tag]),
      toBytesBytesArray(this.hash),
      serializedVersion.toBytes(),
      toBytesString(this.entryPoint),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class Transfer extends ExecutableDeployItemInternal {
  public tag = 5;

  @jsonMember({
    deserializer: desRA,
    serializer: serRA
  })
  public args: RuntimeArgs;

  /**
   * Constructor for Transfer deploy item.
   * @param amount The number of motes to transfer
   * @param target URef of the target purse or the public key of target account. You could generate this public key from accountHex by PublicKey.fromHex
   * @param sourcePurse URef of the source purse. If this is omitted, the main purse of the account creating this \
   * transfer will be used as the source purse
   * @param id user-defined transfer id
   */
  constructor(args: RuntimeArgs) {
    super();
    this.args = args;
  }

  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      toBytesBytesArray(this.args.toBytes())
    ]);
  }
}

@jsonObject
export class ExecutableDeployItem implements ToBytes {
  @jsonMember({
    name: 'ModuleBytes',
    constructor: ModuleBytes
  })
  public moduleBytes?: ModuleBytes;

  @jsonMember({
    name: 'StoredContractByHash',
    constructor: StoredContractByHash
  })
  public storedContractByHash?: StoredContractByHash;

  @jsonMember({
    name: 'StoredContractByName',
    constructor: StoredContractByName
  })
  public storedContractByName?: StoredContractByName;

  @jsonMember({
    name: 'StoredVersionedContractByHash',
    constructor: StoredVersionedContractByHash
  })
  public storedVersionedContractByHash?: StoredVersionedContractByHash;

  @jsonMember({
    name: 'StoredVersionedContractByName',
    constructor: StoredVersionedContractByName
  })
  public storedVersionedContractByName?: StoredVersionedContractByName;
  @jsonMember({
    name: 'Transfer',
    constructor: Transfer
  })
  public transfer?: Transfer;

  public toBytes(): Uint8Array {
    if (this.isModuleBytes()) {
      return this.moduleBytes!.toBytes();
    } else if (this.isStoredContractByHash()) {
      return this.storedContractByHash!.toBytes();
    } else if (this.isStoredContractByName()) {
      return this.storedContractByName!.toBytes();
    } else if (this.isStoredVersionContractByHash()) {
      return this.storedVersionedContractByHash!.toBytes();
    } else if (this.isStoredVersionContractByName()) {
      return this.storedVersionedContractByName!.toBytes();
    } else if (this.isTransfer()) {
      return this.transfer!.toBytes();
    }
    throw new Error('failed to serialize ExecutableDeployItemJsonWrapper');
  }

  public getArgByName(name: string): CLValue | undefined {
    if (this.isModuleBytes()) {
      return this.moduleBytes!.getArgByName(name);
    } else if (this.isStoredContractByHash()) {
      return this.storedContractByHash!.getArgByName(name);
    } else if (this.isStoredContractByName()) {
      return this.storedContractByName!.getArgByName(name);
    } else if (this.isStoredVersionContractByHash()) {
      return this.storedVersionedContractByHash!.getArgByName(name);
    } else if (this.isStoredVersionContractByName()) {
      return this.storedVersionedContractByName!.getArgByName(name);
    } else if (this.isTransfer()) {
      return this.transfer!.getArgByName(name);
    }
    throw new Error('failed to serialize ExecutableDeployItemJsonWrapper');
  }

  public setArg(name: string, value: CLValue) {
    if (this.isModuleBytes()) {
      return this.moduleBytes!.setArg(name, value);
    } else if (this.isStoredContractByHash()) {
      return this.storedContractByHash!.setArg(name, value);
    } else if (this.isStoredContractByName()) {
      return this.storedContractByName!.setArg(name, value);
    } else if (this.isStoredVersionContractByHash()) {
      return this.storedVersionedContractByHash!.setArg(name, value);
    } else if (this.isStoredVersionContractByName()) {
      return this.storedVersionedContractByName!.setArg(name, value);
    } else if (this.isTransfer()) {
      return this.transfer!.setArg(name, value);
    }
    throw new Error('failed to serialize ExecutableDeployItemJsonWrapper');
  }

  public static fromExecutableDeployItemInternal(
    item: ExecutableDeployItemInternal
  ) {
    const res = new ExecutableDeployItem();
    switch (item.tag) {
      case 0:
        res.moduleBytes = item as ModuleBytes;
        break;
      case 1:
        res.storedContractByHash = item as StoredContractByHash;
        break;
      case 2:
        res.storedContractByName = item as StoredContractByName;
        break;
      case 3:
        res.storedVersionedContractByHash = item as StoredVersionedContractByHash;
        break;
      case 4:
        res.storedVersionedContractByName = item as StoredVersionedContractByName;
        break;
      case 5:
        res.transfer = item as Transfer;
        break;
    }
    return res;
  }

  public static newModuleBytes(
    moduleBytes: Uint8Array,
    args: RuntimeArgs
  ): ExecutableDeployItem {
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new ModuleBytes(moduleBytes, args)
    );
  }

  public static newStoredContractByHash(
    hash: Uint8Array,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new StoredContractByHash(hash, entryPoint, args)
    );
  }

  public static newStoredContractByName(
    name: string,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new StoredContractByName(name, entryPoint, args)
    );
  }

  public static newStoredVersionContractByHash(
    hash: Uint8Array,
    version: number | null,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new StoredVersionedContractByHash(hash, version, entryPoint, args)
    );
  }

  public static newStoredVersionContractByName(
    name: string,
    version: number | null,
    entryPoint: string,
    args: RuntimeArgs
  ) {
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new StoredVersionedContractByName(name, version, entryPoint, args)
    );
  }

  /**
   * Constructor for Transfer deploy item.
   * @param amount The number of motes to transfer
   * @param target URef of the target purse or the public key of target account. You could generate this public key from accountHex by PublicKey.fromHex
   * @param sourcePurse URef of the source purse. If this is omitted, the main purse of the account creating this \
   * transfer will be used as the source purse
   * @param id user-defined transfer id. This parameter is required.
   */
  public static newTransfer(
    amount: BigNumberish,
    target: URef | PublicKey,
    sourcePurse: URef | null = null,
    id: BigNumberish
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({});
    runtimeArgs.insert('amount', CLValue.u512(amount));
    if (sourcePurse) {
      runtimeArgs.insert('source', CLValue.uref(sourcePurse));
    }
    if (target instanceof URef) {
      runtimeArgs.insert('target', CLValue.uref(target));
    } else if (target instanceof PublicKey) {
      runtimeArgs.insert('target', CLValue.byteArray(target.toAccountHash()));
    } else {
      throw new Error('Please specify target');
    }
    if (id === undefined) {
      throw new Error('transfer-id missing in new transfer.');
    } else {
      runtimeArgs.insert(
        'id',
        CLValue.option(CLTypedAndToBytesHelper.u64(id), CLTypeHelper.u64())
      );
    }
    return ExecutableDeployItem.fromExecutableDeployItemInternal(
      new Transfer(runtimeArgs)
    );
  }

  /**
   * Constructor for Transfer deploy item using UniqAddress.
   * @param source PublicKey of source account
   * @param target UniqAddress of target account
   * @param amount The number of motes to transfer
   * @param paymentAmount the number of motes paying to execution engine
   * @param chainName Name of the chain, to avoid the `Deploy` from being accidentally or maliciously included in a different chain.
   * @param gasPrice Conversion rate between the cost of Wasm opcodes and the motes sent by the payment code.
   * @param ttl Time that the `Deploy` will remain valid for, in milliseconds. The default value is 1800000, which is 30 minutes
   * @param sourcePurse URef of the source purse. If this is omitted, the main purse of the account creating this \
   * transfer will be used as the source purse
   */
  public static newTransferToUniqAddress(
    source: PublicKey,
    target: UniqAddress,
    amount: BigNumberish,
    paymentAmount: BigNumberish,
    chainName: string,
    gasPrice = 1,
    ttl = 1800000,
    sourcePurse?: URef
  ): Deploy {
    const deployParams = new DeployUtil.DeployParams(
      source,
      chainName,
      gasPrice,
      ttl
    );

    const payment = DeployUtil.standardPayment(paymentAmount);

    const session = DeployUtil.ExecutableDeployItem.newTransfer(
      amount,
      target.publicKey,
      sourcePurse,
      target.transferId
    );

    return DeployUtil.makeDeploy(deployParams, session, payment);
  }

  public isModuleBytes(): boolean {
    return !!this.moduleBytes;
  }

  public asModuleBytes(): ModuleBytes | undefined {
    return this.moduleBytes;
  }

  public isStoredContractByHash(): boolean {
    return !!this.storedContractByHash;
  }

  public asStoredContractByHash(): StoredContractByHash | undefined {
    return this.storedContractByHash;
  }

  public isStoredContractByName(): boolean {
    return !!this.storedContractByName;
  }

  public asStoredContractByName(): StoredContractByName | undefined {
    return this.storedContractByName;
  }

  public isStoredVersionContractByName(): boolean {
    return !!this.storedVersionedContractByName;
  }

  public asStoredVersionContractByName():
    | StoredVersionedContractByName
    | undefined {
    return this.storedVersionedContractByName;
  }

  public isStoredVersionContractByHash(): boolean {
    return !!this.storedVersionedContractByHash;
  }

  public asStoredVersionContractByHash():
    | StoredVersionedContractByHash
    | undefined {
    return this.storedVersionedContractByHash;
  }

  public isTransfer() {
    return !!this.transfer;
  }

  public asTransfer(): Transfer | undefined {
    return this.transfer;
  }
}

/**
 * A deploy containing a smart contract along with the requester's signature(s).
 */
@jsonObject
export class Deploy {
  @jsonMember({
    serializer: byteArrayJsonSerializer,
    deserializer: byteArrayJsonDeserializer
  })
  public hash: Uint8Array;

  @jsonMember({ constructor: DeployHeader })
  public header: DeployHeader;

  @jsonMember({
    constructor: ExecutableDeployItem
  })
  public payment: ExecutableDeployItem;

  @jsonMember({
    constructor: ExecutableDeployItem
  })
  public session: ExecutableDeployItem;

  @jsonArrayMember(Approval)
  public approvals: Approval[];

  /**
   *
   * @param hash The DeployHash identifying this Deploy
   * @param header The deployHeader
   * @param payment The ExecutableDeployItem for payment code.
   * @param session the ExecutableDeployItem for session code.
   * @param approvals  An array of signature and public key of the signers, who approve this deploy
   */
  constructor(
    hash: Uint8Array,
    header: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem,
    approvals: Approval[]
  ) {
    this.approvals = approvals;
    this.session = session;
    this.payment = payment;
    this.header = header;
    this.hash = hash;
  }

  public isTransfer(): boolean {
    return this.session.isTransfer();
  }

  public isStandardPayment(): boolean {
    if (this.payment.isModuleBytes()) {
      return this.payment.asModuleBytes()?.moduleBytes.length === 0;
    }
    return false;
  }
}

/**
 * Serialize deployHeader into a array of bytes
 * @param deployHeader
 */
export const serializeHeader = (deployHeader: DeployHeader): Uint8Array => {
  return deployHeader.toBytes();
};

/**
 * Serialize deployBody into a array of bytes
 * @param payment
 * @param session
 */
export const serializeBody = (
  payment: ExecutableDeployItem,
  session: ExecutableDeployItem
): Uint8Array => {
  return concat([payment.toBytes(), session.toBytes()]);
};

export const serializeApprovals = (approvals: Approval[]): Uint8Array => {
  const len = toBytesU32(approvals.length);
  const bytes = concat(approvals.map(approval => {
    return concat([
      Uint8Array.from(Buffer.from(approval.signer, 'hex')),
      Uint8Array.from(Buffer.from(approval.signature, 'hex'))
    ]);
  }));
  return concat([len, bytes]);
}

/**
 * Supported contract type
 */
export enum ContractType {
  WASM = 'WASM',
  Hash = 'Hash',
  Name = 'Name'
}

export class DeployParams {
  /**
   * Container for `Deploy` construction options.
   * @param accountPublicKey
   * @param chainName Name of the chain, to avoid the `Deploy` from being accidentally or maliciously included in a different chain.
   * @param gasPrice Conversion rate between the cost of Wasm opcodes and the motes sent by the payment code.
   * @param ttl Time that the `Deploy` will remain valid for, in milliseconds. The default value is 1800000, which is 30 minutes
   * @param dependencies Hex-encoded `Deploy` hashes of deploys which must be executed before this one.
   * @param timestamp  If `timestamp` is empty, the current time will be used. Note that timestamp is UTC, not local.
   */
  constructor(
    public accountPublicKey: PublicKey,
    public chainName: string,
    public gasPrice: number = 1,
    public ttl: number = 1800000,
    public dependencies: Uint8Array[] = [],
    public timestamp?: number
  ) {
    this.dependencies = dependencies.filter(
      d =>
        dependencies.filter(t => encodeBase16(d) === encodeBase16(t)).length < 2
    );
    if (!timestamp) {
      this.timestamp = Date.now();
    }
  }
}

/**
 * Makes Deploy message
 */
export function makeDeploy(
  deployParam: DeployParams,
  session: ExecutableDeployItem,
  payment: ExecutableDeployItem
): Deploy {
  const serializedBody = serializeBody(payment, session);
  const bodyHash = blake.blake2b(serializedBody, null, 32);

  const header: DeployHeader = new DeployHeader(
    deployParam.accountPublicKey,
    deployParam.timestamp!,
    deployParam.ttl,
    deployParam.gasPrice,
    bodyHash,
    deployParam.dependencies,
    deployParam.chainName
  );
  const serializedHeader = serializeHeader(header);
  const deployHash = blake.blake2b(serializedHeader, null, 32);
  return new Deploy(deployHash, header, payment, session, []);
}

/**
 * Uses the provided key pair to sign the Deploy message
 *
 * @param deploy
 * @param signingKey the keyPair to sign deploy
 */
export const signDeploy = (
  deploy: Deploy,
  signingKey: AsymmetricKey
): Deploy => {
  const approval = new Approval();
  const signature = signingKey.sign(deploy.hash);
  approval.signer = signingKey.accountHex();
  switch (signingKey.signatureAlgorithm) {
    case SignatureAlgorithm.Ed25519:
      approval.signature = Keys.Ed25519.accountHex(signature);
      break;
    case SignatureAlgorithm.Secp256K1:
      approval.signature = Keys.Secp256K1.accountHex(signature);
      break;
  }
  deploy.approvals.push(approval);

  return deploy;
};

/**
 * Sets the already generated Ed25519 signature for the Deploy message
 *
 * @param deploy
 * @param sig the Ed25519 signature
 * @param publicKey the public key used to generate the Ed25519 signature
 */
export const setSignature = (
  deploy: Deploy,
  sig: Uint8Array,
  publicKey: PublicKey
): Deploy => {
  const approval = new Approval();
  approval.signer = publicKey.toAccountHex();
  switch (publicKey.signatureAlgorithm()) {
    case SignatureAlgorithm.Ed25519:
      approval.signature = Keys.Ed25519.accountHex(sig);
      break;
    case SignatureAlgorithm.Secp256K1:
      approval.signature = Keys.Secp256K1.accountHex(sig);
      break;
  }
  deploy.approvals.push(approval);
  return deploy;
};

/**
 * Standard payment code.
 *
 * @param paymentAmount the number of motes paying to execution engine
 */
export const standardPayment = (paymentAmount: BigNumberish) => {
  const paymentArgs = RuntimeArgs.fromMap({
    amount: CLValue.u512(paymentAmount.toString())
  });

  return ExecutableDeployItem.newModuleBytes(Uint8Array.from([]), paymentArgs);
};

/**
 * Convert the deploy object to json
 *
 * @param deploy
 */
export const deployToJson = (deploy: Deploy) => {
  const serializer = new TypedJSON(Deploy);
  return {
    deploy: serializer.toPlainJson(deploy)
  };
};

/**
 * Convert the json to deploy object
 *
 * @param json
 */
export const deployFromJson = (json: any) => {
  const serializer = new TypedJSON(Deploy);
  const deploy = serializer.parse(json.deploy);
  if (deploy !== undefined && validateDeploy(deploy).ok) {
    return deploy;
  }
  return undefined;
};

export const addArgToDeploy = (
  deploy: Deploy,
  name: string,
  value: CLValue
): Deploy => {
  if (deploy.approvals.length !== 0) {
    throw Error('Can not add argument to already signed deploy.');
  }

  const deployParams = new DeployUtil.DeployParams(
    deploy.header.account,
    deploy.header.chainName,
    deploy.header.gasPrice,
    deploy.header.ttl,
    deploy.header.dependencies,
    deploy.header.timestamp
  );

  const session = deploy.session;
  session.setArg(name, value);

  return makeDeploy(deployParams, session, deploy.payment);
};

export const deploySizeInBytes = (deploy: Deploy): number => {
  const hashSize = deploy.hash.length;
  const bodySize = serializeBody(deploy.payment, deploy.session).length;
  const headerSize = serializeHeader(deploy.header).length;
  const approvalsSize = deploy.approvals
    .map(approval => {
      return (approval.signature.length + approval.signer.length) / 2;
    })
    .reduce((a, b) => a + b, 0);

  return hashSize + headerSize + bodySize + approvalsSize;
};

export const validateDeploy = (deploy: Deploy): Result<Deploy, string> => {
  const serializedBody = serializeBody(deploy.payment, deploy.session);
  const bodyHash = blake.blake2b(serializedBody, null, 32);

  if (!arrayEquals(deploy.header.bodyHash, bodyHash)) {
    return Err(`Invalid deploy: bodyHash missmatch. Expected: ${bodyHash}, 
                  got: ${deploy.header.bodyHash}.`);
  }

  const serializedHeader = serializeHeader(deploy.header);
  const deployHash = blake.blake2b(serializedHeader, null, 32);

  if (!arrayEquals(deploy.hash, deployHash)) {
    return Err(`Invalid deploy: hash missmatch. Expected: ${deployHash}, 
                  got: ${deploy.hash}.`);
  }

  // TODO: Verify included signatures.

  return Ok(deploy);
};

const arrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};

export const deployToBytes = (deploy: Deploy): Uint8Array => {
  return concat([
    serializeHeader(deploy.header),
    deploy.hash,
    serializeBody(deploy.payment, deploy.session),
    serializeApprovals(deploy.approvals)
  ]);
}
