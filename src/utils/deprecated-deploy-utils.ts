import { Result, Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import fetch from 'node-fetch';
import {
  Approval,
  CLValue,
  Conversions,
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  Hash,
  HexBytes,
  Timestamp
} from '../types';
import { CLPublicKey } from './deprecated-clPublicKey';
import { byteHash, toBytesU32 } from '../types/ByteConverters';
import { AsymmetricKey, validateSignature } from './deprecated-keys';
import {humanizerTTL, dehumanizerTTL } from '../types/SerializationUtils'

export {humanizerTTL, dehumanizerTTL};

/**
 * @deprecated
 * An object containing a unique address constructed from the `transferId` of a `Deploy`
 */
export class UniqAddress {
  /** The `CLPublicKey` representation of the transacting account */
  publicKey: CLPublicKey;

  /** A transaction nonce */
  transferId: BigNumber;

  /**
   * Constructs UniqAddress from the transacting account's `CLPublicKey` and unique transferId.
   * @param publicKey CLPublicKey instance
   * @param transferId BigNumberish value (can be also string representing number). Max U64.
   */
  constructor(publicKey: CLPublicKey, transferId: BigNumberish) {
    if (!(publicKey instanceof CLPublicKey)) {
      throw new Error('publicKey is not an instance of CLPublicKey');
    }
    const bigNum = BigNumber.from(transferId);
    if (bigNum.gt('18446744073709551615')) {
      throw new Error('transferId max value is U64');
    }
    this.transferId = bigNum;
    this.publicKey = publicKey;
  }

  /**
   * Stringifies the `UniqAddress`
   * @returns string with the format "accountHex-transferIdHex"
   */
  toString(): string {
    return `${this.publicKey.toHex()}-${this.transferId.toHexString()}`;
  }

  /**
   * @deprecated
   * Builds UniqAddress from string
   * @param value `UniqAddress` string representation in the format "accountHex-transferIdHex"
   * @returns A new `UniqAddress`
   */
  static fromString(value: string): UniqAddress {
    const [accountHex, transferHex] = value.split('-');
    const publicKey = CLPublicKey.fromHex(accountHex);
    return new UniqAddress(publicKey, transferHex);
  }
}

/**
 * @deprecated use {@link DeployHeader.toBytes}
 * Serializes a `DeployHeader` into an array of bytes
 * @param deployHeader
 * @returns A serialized representation of the provided `DeployHeader`
 */
export const serializeHeader = (deployHeader: DeployHeader): Uint8Array => {
  return deployHeader.toBytes();
};

/**
 * @deprecated
 * Serializes the body of a deploy into an array of bytes
 * @param payment Payment logic for use in a deployment
 * @param session Session logic of a deploy
 * @returns `Uint8Array` typed byte array, containing the payment and session logic of a deploy
 */
export const serializeBody = (
  payment: ExecutableDeployItem,
  session: ExecutableDeployItem
): Uint8Array => {
  return concat([payment.bytes(), session.bytes()]);
};

/**
 * @deprecated
 * Serializes an array of `Approval`s into a `Uint8Array` typed byte array
 * @param approvals An array of `Approval`s to be serialized
 * @returns `Uint8Array` typed byte array that can be deserialized to an array of `Approval`s
 */
export const serializeApprovals = (approvals: Approval[]): Uint8Array => {
  const len = toBytesU32(approvals.length);
  const bytes = concat(
    approvals.map(approval => {
      return concat([
        approval.signer.bytes(),
        approval.signature.bytes,
      ]);
    })
  );
  return concat([len, bytes]);
};

/**
 * @deprecated
 * enum of supported contract types
 * @enum
 */
export enum ContractType {
  /** A pure WebAssembly representation of a smart contract */
  WASM = 'WASM',
  /** A linked contract by hash */
  Hash = 'Hash',
  /** A linked contract by name */
  Name = 'Name'
}

/**
 * The parameters of a `Deploy` object
 * @deprecated use {@link Deploy.makeDeploy}
 * */
export class DeployParams {
  /**
   * Container for `Deploy` construction options.
   * @param accountPublicKey The public key of the deploying account as a `CLPublicKey`
   * @param chainName Name of the chain, to avoid the `Deploy` from being accidentally or maliciously included in a different chain.
   * @param gasPrice Conversion rate between the cost of Wasm opcodes and the motes sent by the payment code, where 1 mote = 1 * 10^-9 CSPR
   * @param ttl Time that the `Deploy` will remain valid for, in milliseconds. The default value is 1800000, which is 30 minutes
   * @param dependencies Hex-encoded `Deploy` hashes of deploys which must be executed before this one.
   * @param timestamp  Note that timestamp is UTC, not local.
   */
  constructor(
    public accountPublicKey: CLPublicKey,
    public chainName: string,
    public gasPrice: number = 1,
    public ttl: number = DEFAULT_DEPLOY_TTL,
    public dependencies: Uint8Array[] = [],
    public timestamp?: number
  ) {
    this.dependencies = dependencies.filter(
      d =>
        dependencies.filter(
          t => Conversions.encodeBase16(d) === Conversions.encodeBase16(t)
        ).length < 2
    );
  }
}

/**
 * @deprecated use {@link Deploy.makeDeploy}
 * Builds a `Deploy` object from `DeployParams`, session logic, and payment logic
 * @param deployParam The parameters of the deploy, see [DeployParams](#L1323)
 * @param session The session logic of the deploy
 * @param payment The payment logic of the deploy
 * @returns A new `Deploy` object
 */
export function makeDeploy(
  deployParam: DeployParams,
  session: ExecutableDeployItem,
  payment: ExecutableDeployItem
): Deploy {
  const serializedBody = serializeBody(payment, session);
  const bodyHash = byteHash(serializedBody);

  if (!deployParam.timestamp) {
    deployParam.timestamp = Date.now();
  }

  const header: DeployHeader = new DeployHeader(
    deployParam.chainName,
    deployParam.dependencies.map(d => new Hash(d)),
    deployParam.gasPrice,
    new Timestamp(new Date(deployParam.timestamp!)),
    new Duration(deployParam.ttl),
    deployParam.accountPublicKey.pk,
    new Hash(bodyHash)
  );

  const serializedHeader = serializeHeader(header);
  const deployHash = byteHash(serializedHeader);

  return new Deploy(new Hash(deployHash), header, payment, session, []);
}

type TimeJSON = {
  unixtime: number;
};


class TimeService {
  constructor(public url: string) {}

  async getTime(): Promise<TimeJSON> {
    const result = await fetch(this.url);
    const json = await result.json();

    return json as TimeJSON;
  }
}

const TIME_API_URL = `worldtimeapi.org/api/timezone/UTC`;

/**
 * @deprecated
 * Builds a `Deploy` object from `DeployParams`, session logic, and payment logic.
 * If there is no timestamp in `DeployParams` it fetches it from the TimeService.
 * Recommened to use in browser environment.
 * @param deployParam The parameters of the deploy, see [DeployParams](#L1323)
 * @param session The session logic of the deploy
 * @param payment The payment logic of the deploy
 * @returns A new `Deploy` object
 */
export async function makeDeployWithAutoTimestamp(
  deployParam: DeployParams,
  session: ExecutableDeployItem,
  payment: ExecutableDeployItem
): Promise<Deploy> {
  if (!deployParam.timestamp && typeof window !== 'undefined') {
    const timeService = new TimeService(
      `${location.protocol}//${TIME_API_URL}`
    );
    const { unixtime } = await timeService.getTime();
    deployParam.timestamp = unixtime;
  }

  return makeDeploy(deployParam, session, payment);
}

/**
 * @deprecated use {@link Deploy.sign}
 * Uses the provided key pair to sign the Deploy message
 * @param deploy Either an unsigned `Deploy` object or one with other signatures
 * @param signingKey The keypair used to sign the `Deploy`
 */
export const signDeploy = (
  deploy: Deploy,
  signingKey: AsymmetricKey
): Deploy => {
  const approval = new Approval(
    signingKey.publicKey.pk,
    new HexBytes(signingKey.sign(deploy.hash.toBytes()))
  );

  deploy.approvals.push(approval);

  return deploy;
};

/**
 * @deprecated use {@link Deploy.setSignature}
 * Sets the algorithm of the already generated signature
 *
 * @param deploy A `Deploy` to be signed with `sig`
 * @param sig the Ed25519 or Secp256K1 signature
 * @param publicKey the public key used to generate the signature
 */
export const setSignature = (
  deploy: Deploy,
  sig: Uint8Array,
  publicKey: CLPublicKey
): Deploy => {
  const approval = new Approval(publicKey.pk, new HexBytes(sig));

  deploy.approvals.push(approval);
  return deploy;
};

/**
 * @deprecated use {@link ExecutableDeployItem.standardPayment}
 * Creates an instance of standard payment logic
 *
 * @param paymentAmount The amount of motes to be used to pay for gas
 * @returns A standard payment, as an `ExecutableDeployItem` to be attached to a `Deploy`
 */
export const standardPayment = ExecutableDeployItem.standardPayment;

/**
 * @deprecated use {@link Deploy.toJSON}
 * Convert the deploy object to a JSON representation
 *
 * @param deploy The `Deploy` object to convert to JSON
 * @returns A JSON version of the `Deploy`, which can be converted back later
 */
export const deployToJson = (deploy: Deploy) => {
  return {
    deploy: Deploy.toJSON(deploy)
  };
};

/**
 * @deprecated use {@link Deploy.fromJson}
 * Convert a JSON representation of a deploy to a `Deploy` object
 *
 * @param json A JSON representation of a `Deploy`
 * @returns A `Result` that collapses to a `Deploy` or an error string
 */
export const deployFromJson = (json: any): Result<Deploy, Error> => {
  if (json.deploy === undefined) {
    return new Err(new Error("The Deploy JSON doesn't have 'deploy' field."));
  }
  let deploy = null;
  try {
    deploy = Deploy.fromJSON(json.deploy);
  } catch (serializationError) {
    return new Err(serializationError);
  }

  if (deploy === undefined || deploy === null) {
    return Err(new Error("The JSON can't be parsed as a Deploy."));
  }

  const valid = validateDeploy(deploy);

  if (valid.err) {
    return new Err(new Error(valid.val));
  }

  return new Ok(deploy);
};

/**
 * @deprecated use {@link Deploy.session}.setArg
 * Adds a runtime argument to a `Deploy` object
 * @param deploy The `Deploy` object for which to add the runtime argument
 * @param name The name of the runtime argument
 * @param value The value of the runtime argument
 * @returns The original `Deploy` with the additional runtime argument
 * @remarks Will fail if the `Deploy` has already been signed
 */
export const addArgToDeploy = (
  deploy: Deploy,
  name: string,
  value: CLValue
): Deploy => {
  if (deploy.approvals.length !== 0) {
    throw Error('Can not add argument to already signed deploy.');
  }

  deploy.session.setArg(name, value);

  return deploy;
};

/**
 * @deprecated
 * Gets the byte-size of a deploy
 * @param deploy The `Deploy` for which to calculate the size
 * @returns The size of the `Deploy` in its serialized representation
 */
export const deploySizeInBytes = (deploy: Deploy): number => {
  const hashSize = deploy.hash.toBytes().length;
  const bodySize = serializeBody(deploy.payment, deploy.session).length;
  const headerSize = serializeHeader(deploy.header).length;
  const approvalsSize = deploy.approvals
    .map(approval => {
      return (
        (approval.signature.bytes.length + approval.signer.bytes().length) / 2
      );
    })
    .reduce((a, b) => a + b, 0);

  return hashSize + headerSize + bodySize + approvalsSize;
};

/**
 * @deprecated use {@link Deploy.validate}
 * Validate a `Deploy` by calculating and comparing its stored blake2b hash
 * @param deploy A `Deploy` to be validated
 * @returns A `Result` that collapses to a `Deploy` or an error string
 */
export const validateDeploy = (deploy: Deploy): Result<Deploy, string> => {
  if (!(deploy instanceof Deploy)) {
    return new Err("'deploy' is not an instance of Deploy class.");
  }

  const serializedBody = serializeBody(deploy.payment, deploy.session);
  const bodyHash = byteHash(serializedBody);

  if (!arrayEquals(deploy.header.bodyHash!.toBytes(), bodyHash)) {
    return Err(`Invalid deploy: bodyHash mismatch. Expected: ${bodyHash},
                  got: ${deploy.header.bodyHash}.`);
  }

  const serializedHeader = serializeHeader(deploy.header);
  const deployHash = byteHash(serializedHeader);

  if (!arrayEquals(deploy.hash.toBytes(), deployHash)) {
    return Err(`Invalid deploy: hash mismatch. Expected: ${deployHash},
                  got: ${deploy.hash}.`);
  }

  const isProperlySigned = deploy.approvals.every(({ signer, signature }) => {
    const pk = CLPublicKey.fromHex(signer.toHex(), false);
    const signatureRaw = Conversions.decodeBase16(signature.toHex().slice(2));
    return validateSignature(deploy.hash.toBytes(), signatureRaw, pk);
  });

  if (!isProperlySigned) {
    return Err('Invalid signature.');
  } else {
    return Ok(deploy);
  }
};

/**
 * @deprecated
 * Compares two `Uint8Array`s
 * @param a The first `Uint8Array`
 * @param b The second `Uint8Array`
 * @returns `true` if the two `Uint8Array`s match, and `false` otherwise
 */
export const arrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};

/**
 * @deprecated
 * Serializes a `Deploy` to a `Uint8Array`
 * @param deploy The `Deploy` to be serialized
 * @returns A `Uint8Array` serialization of the provided `Deploy`
 */
export const deployToBytes = (deploy: Deploy): Uint8Array => {
  return concat([
    serializeHeader(deploy.header),
    deploy.hash.toBytes(),
    serializeBody(deploy.payment, deploy.session),
    serializeApprovals(deploy.approvals)
  ]);
};
