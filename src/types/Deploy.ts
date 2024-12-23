import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { Hash } from './key';
import { HexBytes } from './HexBytes';
import { PublicKey, PrivateKey } from './keypair';
import { Duration, Timestamp } from './Time';
import { Approval, Transaction } from './Transaction';
import {
  TransactionEntryPoint,
  TransactionEntryPointEnum
} from './TransactionEntryPoint';
import { InitiatorAddr } from './InitiatorAddr';
import { PaymentLimitedMode, PricingMode } from './PricingMode';
import { TransactionTarget } from './TransactionTarget';
import { TransactionScheduling } from './TransactionScheduling';
import { ExecutableDeployItem } from './ExecutableDeployItem';
import {
  byteHash,
  toBytesString,
  toBytesU32,
  toBytesU64
} from './ByteConverters';

/**
 * Represents the header of a deploy in the blockchain.
 * The header contains metadata such as the account initiating the deploy, the body hash, gas price, timestamp, TTL, and dependencies.
 */
@jsonObject
export class DeployHeader {
  /**
   * The public key of the account initiating the deploy.
   * This key is used to verify the identity of the account making the deploy request.
   */
  @jsonMember({
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public account?: PublicKey;

  /**
   * The hash of the body of the deploy, which is used to verify the contents of the deploy.
   * The body contains the session logic and payment logic of the deploy.
   */
  @jsonMember({
    name: 'body_hash',
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
  public bodyHash?: Hash;

  /**
   * The name of the blockchain chain that the deploy is associated with.
   * This helps prevent the deploy from being accidentally or maliciously included in a different chain.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName = '';

  /**
   * A list of other deploys that must be executed before this one.
   * This ensures dependencies are executed in the correct order.
   */
  @jsonArrayMember(Hash, {
    name: 'dependencies',
    serializer: (value: Hash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => Hash.fromJSON(it))
  })
  public dependencies: Hash[] = [];

  /**
   * The price of gas for executing the deploy.
   * Gas is used to pay for the computational resources required to process the deploy.
   */
  @jsonMember({ name: 'gas_price', constructor: Number })
  public gasPrice = 1;

  /**
   * The timestamp when the deploy was created.
   * This timestamp is used to determine the deploy's position in time.
   */
  @jsonMember({
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp = new Timestamp(new Date());

  /**
   * The time-to-live (TTL) for the deploy, after which it will expire if not executed.
   * The default TTL is 30 minutes.
   */
  @jsonMember({
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration = new Duration(DEFAULT_DEPLOY_TTL);

  /**
   * Constructs a `DeployHeader` instance with the specified parameters.
   * @param chainName The name of the blockchain chain.
   * @param dependencies A list of deploys that must be executed before this one.
   * @param gasPrice The gas price for the deploy.
   * @param timestamp The timestamp when the deploy is created.
   * @param ttl The TTL for the deploy.
   * @param account The public key of the account initiating the deploy (optional).
   * @param bodyHash The hash of the body of the deploy (optional).
   */
  constructor(
    chainName = '',
    dependencies: Hash[] = [],
    gasPrice = 1,
    timestamp: Timestamp = new Timestamp(new Date()),
    ttl: Duration = new Duration(DEFAULT_DEPLOY_TTL),
    account?: PublicKey,
    bodyHash?: Hash
  ) {
    this.chainName = chainName;
    this.dependencies = dependencies;
    this.gasPrice = gasPrice;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.account = account;
    this.bodyHash = bodyHash;
  }

  /**
   * Converts the deploy header to a byte array for transmission or storage.
   * @returns A `Uint8Array` representing the deploy header in byte format.
   */
  public toBytes(): Uint8Array {
    const dependenciesBytes = this.dependencies.map(e => e.toBytes());
    dependenciesBytes.splice(0, 0, toBytesU32(this.dependencies?.length));

    return concat([
      this.account!.bytes(),
      toBytesU64(Date.parse(this.timestamp.toJSON())),
      toBytesU64(this.ttl.duration),
      toBytesU64(this.gasPrice),
      this.bodyHash!.toBytes(),
      concat(dependenciesBytes),
      toBytesString(this.chainName)
    ]);
  }

  /**
   * Returns a default `DeployHeader` instance with default values.
   * @returns A `DeployHeader` instance with default values.
   */
  public static default(): DeployHeader {
    return new DeployHeader();
  }
}

/**
 * Represents a deploy in the blockchain, including the header, payment, session, and approvals.
 * A `Deploy` object is used to package the logic for executing a contract, payment, or transfer on the blockchain.
 */
@jsonObject
export class Deploy {
  /**
   * A list of approvals, including signatures from accounts that have approved the deploy.
   */
  @jsonArrayMember(() => Approval)
  public approvals: Approval[] = [];

  /**
   * The unique hash that identifies this deploy. This hash is used to verify the integrity of the deploy.
   */
  @jsonMember({
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The header of the deploy, which contains metadata such as the account, gas price, timestamp, and TTL.
   */
  @jsonMember({ constructor: DeployHeader })
  public header: DeployHeader;

  /**
   * The executable item representing the payment logic of the deploy.
   */
  @jsonMember({ constructor: ExecutableDeployItem })
  public payment: ExecutableDeployItem;

  /**
   * The executable item representing the session logic of the deploy.
   */
  @jsonMember({ constructor: ExecutableDeployItem })
  public session: ExecutableDeployItem;

  /**
   * Constructs a `Deploy` object.
   *
   * @param hash The deploy hash identifying this deploy.
   * @param header The deploy header containing metadata.
   * @param payment The executable deploy item representing the payment logic.
   * @param session The executable deploy item representing the session logic.
   * @param approvals An array of signatures and accounts who have approved this deploy.
   */
  constructor(
    hash: Hash,
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

  /**
   * Validates the deploy by checking its body hash, deploy hash, and approval signatures.
   *
   * @returns `true` if the deploy is valid, otherwise throws an error.
   */
  public validate(): boolean {
    const paymentBytes = this.payment.bytes();
    const sessionBytes = this.session.bytes();
    const concatenatedBytes = concat([paymentBytes, sessionBytes]);
    const calculatedBodyHash = new Hash(byteHash(concatenatedBytes));

    const headerBytes = this.header.toBytes();
    const calculatedHash = new Hash(byteHash(headerBytes));

    if (
      !this.header.bodyHash?.equals(calculatedBodyHash) ||
      !this.hash.equals(calculatedHash)
    ) {
      throw new Error('Invalid deploy hash or body hash');
    }

    this.approvals.forEach(approval => {
      if (
        !approval.signer.verifySignature(
          this.hash.toBytes(),
          approval.signature.bytes
        )
      ) {
        throw new Error('Invalid approval signature');
      }
    });

    return true;
  }

  /**
   * Signs the deploy with a given private key and adds the signature to the approvals list.
   *
   * @param keys The private key used to sign the deploy.
   */
  public sign(keys: PrivateKey): void {
    const signatureBytes = keys.signAndAddAlgorithmBytes(
      this.hash.toBytes()
    );
    const signature = new HexBytes(signatureBytes);
    this.approvals.push(new Approval(keys.publicKey, signature));
  }

  /**
   * Converts the deploy object into a byte array for transmission or storage.
   *
   * @returns A `Uint8Array` representing the deploy in byte format.
   */
  toBytes(): Uint8Array {
    return concat([
      this.header.toBytes(),
      this.hash.toBytes(),
      concat([this.payment.bytes(), this.session.bytes()]),
      serializeApprovals(this.approvals)
    ]);
  }

  /**
   * Sets an already generated signature for the deploy.
   *
   * @param deploy The deploy instance.
   * @param signature The Ed25519 or Secp256K1 signature.
   * @param publicKey The public key used to generate the signature.
   * @returns A new `Deploy` instance with the added signature.
   */
  public static setSignature(
    deploy: Deploy,
    signature: Uint8Array,
    publicKey: PublicKey
  ): Deploy {
    const hex = new HexBytes(signature);
    deploy.approvals.push(new Approval(publicKey, hex));
    return deploy;
  }

  /**
   * Creates a new `Deploy` instance with the provided parameters.
   *
   * @param hash The deploy hash identifying this deploy.
   * @param header The deploy header.
   * @param payment The executable deploy item for the payment logic.
   * @param session The executable deploy item for the session logic.
   * @param approvals An array of approvals for the deploy.
   * @returns A new `Deploy` object.
   */
  public static createNew(
    hash: Hash,
    header: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem,
    approvals: Approval[] = []
  ): Deploy {
    return new Deploy(hash, header, payment, session, approvals);
  }

  /**
   * Creates a `Deploy` instance from the deploy header and session/payment logic.
   *
   * @param deployHeader The deploy header.
   * @param payment The payment logic of the deploy.
   * @param session The session logic of the deploy.
   * @returns A new `Deploy` object.
   */
  public static makeDeploy(
    deployHeader: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem
  ): Deploy {
    const paymentBytes = payment.bytes();
    const sessionBytes = session.bytes();
    const serializedBody = concat([paymentBytes, sessionBytes]);
    deployHeader.bodyHash = new Hash(byteHash(serializedBody));
    const deployHash = new Hash(byteHash(deployHeader.toBytes()));
    return Deploy.createNew(deployHash, deployHeader, payment, session);
  }

  /**
   * Converts the `Deploy` into a `Transaction` object.
   * This method creates a transaction based on the deploy, including its payment and session logic.
   *
   * @param deploy The deploy object.
   * @returns A new `Transaction` object created from the deploy.
   */
  static newTransactionFromDeploy(deploy: Deploy): Transaction {
    let paymentAmount = 0;
    let transactionEntryPoint: TransactionEntryPoint;

    if (deploy.session.transfer) {
      transactionEntryPoint = new TransactionEntryPoint(
        TransactionEntryPointEnum.Transfer
      );
    } else if (deploy.session.moduleBytes) {
      transactionEntryPoint = new TransactionEntryPoint(
        TransactionEntryPointEnum.Call
      );
    } else {
      let entryPoint = '';

      if (deploy.session.storedContractByHash) {
        entryPoint = deploy.session.storedContractByHash.entryPoint;
      } else if (deploy.session.storedContractByName) {
        entryPoint = deploy.session.storedContractByName.entryPoint;
      } else if (deploy.session.storedVersionedContractByHash) {
        entryPoint = deploy.session.storedVersionedContractByHash.entryPoint;
      } else if (deploy.session.storedVersionedContractByName) {
        entryPoint = deploy.session.storedVersionedContractByName.entryPoint;
      }
      transactionEntryPoint = new TransactionEntryPoint(
        TransactionEntryPointEnum.Custom,
        entryPoint
      );
    }

    const amountArgument = deploy.payment.getArgs();
    if (amountArgument) {
      const parsed = amountArgument.args.get('amount');
      if (parsed) {
        paymentAmount = parseInt(parsed.toString(), 10) || 0;
      }
    }

    const standardPayment = paymentAmount === 0 && !deploy.payment.moduleBytes;

    const pricingMode = new PricingMode();
    const paymentLimitedMode = new PaymentLimitedMode();
    paymentLimitedMode.gasPriceTolerance = 1;
    paymentLimitedMode.paymentAmount = paymentAmount;
    paymentLimitedMode.standardPayment = standardPayment;

    return new Transaction(
      deploy.hash,
      deploy.header.chainName,
      deploy.header.timestamp,
      deploy.header.ttl,
      new InitiatorAddr(deploy.header.account),
      pricingMode,
      deploy.session.getArgs(),
      TransactionTarget.newTransactionTargetFromSession(deploy.session),
      transactionEntryPoint,
      new TransactionScheduling({ standard: {} }),
      deploy.approvals,
      undefined,
      deploy
    );
  }

  /**
   * Converts a JSON representation of a deploy to a `Deploy` object.
   *
   * @param json The JSON representation of a `Deploy`.
   * @returns A `Deploy` object if successful, or throws an error if parsing fails.
   */
  public static fromJSON(json: any): Deploy {
    let deploy: Deploy | undefined;

    try {
      const data: Record<string, any> =
        typeof json === 'string' ? JSON.parse(json) : json;

      const deployJson: Record<string, any> | null =
        data.deploy ?? data.Deploy ?? data?.transaction?.Deploy ?? data ?? null;

      if (!(deployJson?.hash && deployJson?.header?.account)) {
        throw new Error("The JSON can't be parsed as a Deploy.");
      }

      const serializer = new TypedJSON(Deploy);
      deploy = serializer.parse(deployJson);

      if (!deploy) {
        throw new Error("The JSON can't be parsed as a Deploy.");
      }
    } catch (e) {
      throw new Error(`Serialization error: ${e.message}`);
    }

    const isDeployValid = deploy.validate();

    if (!isDeployValid) {
      throw new Error(`Deploy validation failed`);
    }

    return deploy;
  }

  /**
   * Converts the `Deploy` object into a JSON representation.
   *
   * @param deploy The deploy object to convert to JSON.
   * @returns A JSON representation of the deploy.
   */
  public static toJSON = (deploy: Deploy) => {
    const serializer = new TypedJSON(Deploy);
    return serializer.toPlainJson(deploy);
  };

  /**
   * Identifies whether this `Deploy` represents a transfer of CSPR.
   *
   * @returns `true` if the deploy is a transfer, otherwise `false`.
   */
  public isTransfer(): boolean {
    return this.session.isTransfer();
  }

  /**
   * Identifies whether this `Deploy` represents a standard payment, like a gas payment.
   *
   * @returns `true` if the deploy is a standard payment, otherwise `false`.
   */
  public isStandardPayment(): boolean {
    if (this.payment.isModuleBytes()) {
      return this.payment.asModuleBytes()?.moduleBytes.length === 0;
    }
    return false;
  }

  /**
   * Gets the byte-size of a deploy
   * @param deploy The `Deploy` for which to calculate the size
   * @returns The size of the `Deploy` in its serialized representation
   */
  public static getDeploySizeInBytes = (deploy: Deploy): number => {
    const hashSize = deploy.hash.toBytes().length;
    const bodySize = concat([deploy.payment.bytes(), deploy.session.bytes()])
      .length;
    const headerSize = deploy.header.toBytes().length;
    const approvalsSize = deploy.approvals
      .map(approval => {
        return (
          (approval.signature.bytes.length + approval.signer.bytes().length) / 2
        );
      })
      .reduce((a, b) => a + b, 0);

    return hashSize + headerSize + bodySize + approvalsSize;
  };
}

/**
 * Serializes an array of `Approval`s into a `Uint8Array` typed byte array.
 * This is used to store or transmit the approvals associated with a deploy.
 *
 * @param approvals An array of `Approval` objects that represent signatures from accounts that have approved the deploy.
 * @returns A `Uint8Array` typed byte array that can be deserialized back into an array of `Approval` objects.
 *
 * @example
 * const approvals = [new Approval(publicKey, signature)];
 * const serializedApprovals = serializeApprovals(approvals);
 */
export const serializeApprovals = (approvals: Approval[]): Uint8Array => {
  const len = toBytesU32(approvals.length);
  const bytes = concat(
    approvals.map(approval => {
      return concat([
        Uint8Array.from(Buffer.from(approval.signer.toString(), 'hex')),
        Uint8Array.from(Buffer.from(approval.signature.toString(), 'hex'))
      ]);
    })
  );
  return concat([len, bytes]);
};

/**
 * Default TTL value used for deploys (30 minutes).
 */
export const DEFAULT_DEPLOY_TTL = 1800000;
