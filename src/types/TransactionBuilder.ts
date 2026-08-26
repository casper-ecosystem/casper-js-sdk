import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { InitiatorAddr } from './InitiatorAddr';
import { PaymentLimitedMode, PricingMode } from './PricingMode';
import {
  ByPackageHashInvocationTarget,
  ByPackageNameInvocationTarget,
  SessionTarget,
  StoredTarget,
  TransactionInvocationTarget,
  TransactionRuntime,
  TransactionTarget
} from './TransactionTarget';
import {
  TransactionEntryPoint,
  TransactionEntryPointEnum
} from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { Args } from './Args';
import { PublicKey } from './keypair';
import { AccountHash, ContractHash, Hash } from './key';
import { Transaction, TransactionV1 } from './Transaction';
import { TransactionV1Payload } from './TransactionV1Payload';
import { Duration, Timestamp } from './Time';
import { CLValue } from './clvalue';
import {
  ExecutableDeployItem,
  StoredContractByHash,
  StoredContractByName,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  TransferDeployItem
} from './ExecutableDeployItem';
import { Deploy, DeployHeader } from './Deploy';
import { AuctionManagerContractHashMap } from '../utils';
import { toError } from '../utils/errors';
import { AuctionManagerEntryPoint, CasperNetworkName } from '../@types';

/**
 * Abstract base class for building Transaction V1 instances.
 * Provides common functionality for all transaction builders including
 * initiator management, chain configuration, timing, and payment settings.
 *
 * @template T - The concrete builder type that extends this class
 */
abstract class TransactionBuilder<T extends TransactionBuilder<T>> {
  protected _initiatorAddr!: InitiatorAddr;
  protected _chainName!: string;
  protected _timestamp = new Timestamp(new Date());
  protected _ttl = new Duration(1800000);
  protected _pricingMode!: PricingMode;
  protected _invocationTarget!: TransactionTarget;
  protected _entryPoint!: TransactionEntryPoint;
  protected _scheduling: TransactionScheduling = new TransactionScheduling({}); // Standard
  protected _runtimeArgs: Args;
  protected _contractHash: string;

  /**
   * Sets the initiator address using a public key.
   *
   * @param publicKey - The public key of the transaction initiator
   * @returns The builder instance for method chaining
   */
  public from(publicKey: PublicKey): T {
    this._initiatorAddr = new InitiatorAddr(publicKey);
    return this as unknown as T;
  }

  /**
   * Sets the initiator address using an account hash.
   *
   * @param accountHashKey - The account hash of the transaction initiator
   * @returns The builder instance for method chaining
   */
  public fromAccountHash(accountHashKey: AccountHash): T {
    this._initiatorAddr = new InitiatorAddr(undefined, accountHashKey);
    return this as unknown as T;
  }

  /**
   * Sets the chain name for the transaction.
   *
   * @param chainName - The name of the Casper network chain (e.g., 'casper-test', 'casper')
   * @returns The builder instance for method chaining
   */
  public chainName(chainName: string): T {
    this._chainName = chainName;
    return this as unknown as T;
  }

  /**
   * Sets the contract hash for the transaction.
   *
   * @param contractHash - The contract hash in hexadecimal format
   * @returns The builder instance for method chaining
   */
  public contractHash(contractHash: string): T {
    this._contractHash = contractHash;
    return this as unknown as T;
  }

  /**
   * Sets the timestamp for the transaction.
   *
   * @param timestamp - The transaction timestamp
   * @returns The builder instance for method chaining
   */
  public timestamp(timestamp: Timestamp): T {
    this._timestamp = timestamp;
    return this as unknown as T;
  }

  /**
   * Sets the time-to-live for the transaction.
   *
   * @param ttl - Time-to-live in milliseconds (default: 1800000ms = 30 minutes)
   * @returns The builder instance for method chaining
   */
  public ttl(ttl: number): T {
    this._ttl = new Duration(ttl);
    return this as unknown as T;
  }

  /**
   * Sets the payment amount for the transaction using a limited payment mode.
   *
   * `gasPriceTolerance` has to sit inside the target chain's
   * `[min_gas_price, max_gas_price]` chainspec window — both are 1 on mainnet
   * and testnet. Nodes from 2.2 on reject anything above the ceiling with
   * `-32016 Invalid transaction`; earlier ones enforced only the floor.
   *
   * @param paymentAmount - The payment amount in motes
   * @param gasPriceTolerance - Gas price tolerance multiplier (default: 1)
   * @returns The builder instance for method chaining
   */
  public payment(paymentAmount: number, gasPriceTolerance = 1): T {
    const pricingMode = new PricingMode();
    const paymentLimited = new PaymentLimitedMode();
    paymentLimited.standardPayment = true;
    paymentLimited.paymentAmount = paymentAmount;
    paymentLimited.gasPriceTolerance = gasPriceTolerance;

    pricingMode.paymentLimited = paymentLimited;
    this._pricingMode = pricingMode;
    return this as unknown as T;
  }

  /**
   * Creates a default deploy header with the configured transaction settings.
   *
   * @returns A deploy header with account, chain name, timestamp, TTL, and gas price
   * @protected
   */
  protected _getDefaultDeployHeader(): DeployHeader {
    const deployHeader = DeployHeader.default();
    deployHeader.account = this._initiatorAddr.publicKey;
    deployHeader.chainName = this._chainName;
    deployHeader.timestamp = this._timestamp;
    deployHeader.ttl = this._ttl;

    if (this._pricingMode.paymentLimited?.gasPriceTolerance) {
      deployHeader.gasPrice =
        this._pricingMode.paymentLimited?.gasPriceTolerance;
    }

    return deployHeader;
  }

  /**
   * Creates a standard payment executable deploy item.
   *
   * @returns An executable deploy item configured for standard payment
   * @throws {Error} If payment amount is not specified
   * @protected
   */
  protected _getStandardPayment(): ExecutableDeployItem {
    if (!this._pricingMode?.paymentLimited?.paymentAmount) {
      throw new Error('PaymentAmount is not specified');
    }

    return ExecutableDeployItem.standardPayment(
      this._pricingMode.paymentLimited.paymentAmount.toString()
    );
  }

  /**
   * Builds and returns the Transaction instance.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    const transactionPayload = TransactionV1Payload.build({
      initiatorAddr: this._initiatorAddr,
      timestamp: this._timestamp,
      ttl: this._ttl,
      chainName: this._chainName,
      pricingMode: this._pricingMode,
      args: this._runtimeArgs,
      transactionTarget: this._invocationTarget,
      entryPoint: this._entryPoint,
      scheduling: this._scheduling
    });

    const transactionV1 = TransactionV1.makeTransactionV1(transactionPayload);
    return Transaction.fromTransactionV1(transactionV1);
  }
}

/**
 * Builder for creating Native Transfer transactions.
 * Enables transferring CSPR tokens from one account to another on the Casper network.
 *
 * @example
 * ```typescript
 * const transaction = new NativeTransferBuilder()
 *   .from(senderPublicKey)
 *   .target(recipientPublicKey)
 *   .amount('2500000000') // 2.5 CSPR in motes
 *   .id(Date.now())
 *   .chainName('casper-test')
 *   .payment(100_000_000)
 *   .build();
 * ```
 */
export class NativeTransferBuilder extends TransactionBuilder<NativeTransferBuilder> {
  private _target!: CLValue;
  private _publicKey: PublicKey;
  private _amount: CLValue = CLValue.newCLUInt512('0');
  private _amountRow: BigNumber | string = '0';
  private _idTransfer?: number;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Transfer
    );
  }

  /**
   * Sets the target public key for the transfer.
   *
   * @param publicKey - The recipient's public key
   * @returns The builder instance for method chaining
   */
  public target(publicKey: PublicKey): NativeTransferBuilder {
    this._publicKey = publicKey;
    this._target = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the target account hash for the transfer.
   *
   * @param accountHashKey - The recipient's account hash
   * @returns The builder instance for method chaining
   */
  public targetAccountHash(accountHashKey: AccountHash): NativeTransferBuilder {
    this._target = CLValue.newCLByteArray(accountHashKey.toBytes());
    return this;
  }

  /**
   * Sets the amount to transfer in motes.
   *
   * @param amount - The transfer amount (1 CSPR = 1,000,000,000 motes)
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeTransferBuilder {
    this._amountRow = amount;
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Sets the transfer ID for tracking purposes.
   *
   * @param id - A unique identifier for this transfer
   * @returns The builder instance for method chaining
   */
  public id(id: number): NativeTransferBuilder {
    this._idTransfer = id;
    return this;
  }

  /**
   * Builds and returns the Native Transfer transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    const runtimeArgs = Args.fromMap({});

    runtimeArgs.insert('target', this._target);
    runtimeArgs.insert('amount', this._amount);

    if (this._idTransfer) {
      runtimeArgs.insert(
        'id',
        CLValue.newCLOption(CLValue.newCLUint64(this._idTransfer))
      );
    }

    this._runtimeArgs = runtimeArgs;
    return super.build();
  }

  /**
   * Builds and returns the Native Transfer transaction for Casper 1.5.
   * Uses the legacy deploy format for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   */
  public buildFor1_5(): Transaction {
    const session = new ExecutableDeployItem();
    session.transfer = TransferDeployItem.newTransfer(
      this._amountRow,
      this._publicKey,
      undefined,
      this._idTransfer
    );

    let payment: ExecutableDeployItem;
    try {
      payment = this._getStandardPayment();
    } catch (error) {
      if (toError(error).message === 'PaymentAmount is not specified') {
        payment = ExecutableDeployItem.standardPayment('100000000'); // Assign default payment value
      } else {
        throw error;
      }
    }

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      payment,
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Add Bid transactions.
 * Used by validators to submit or increase their bid in the Casper auction system.
 *
 * @example
 * ```typescript
 * const transaction = new NativeAddBidBuilder()
 *   .from(validatorPublicKey)
 *   .validator(validatorPublicKey)
 *   .amount('1000000000000') // 1000 CSPR
 *   .delegationRate(10) // 10% commission
 *   .chainName('casper')
 *   .payment(5_000_000_000)
 *   .build();
 * ```
 */
export class NativeAddBidBuilder extends TransactionBuilder<NativeAddBidBuilder> {
  private _validator!: CLValue;
  private _amount!: CLValue;
  private _delegationRate!: CLValue;
  private _minimumDelegationAmount?: CLValue;
  private _maximumDelegationAmount?: CLValue;
  private _reservedSlots?: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.AddBid
    );
  }

  /**
   * Sets the validator's public key for the bid.
   *
   * @param publicKey - The validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeAddBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the bid amount in motes.
   *
   * @param amount - The bid amount (minimum varies by network)
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeAddBidBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Sets the delegation rate (commission percentage).
   *
   * @param delegationRate - Commission rate as a percentage (0-100)
   * @returns The builder instance for method chaining
   */
  public delegationRate(delegationRate: number): NativeAddBidBuilder {
    this._delegationRate = CLValue.newCLUint8(delegationRate);
    return this;
  }

  /**
   * Sets the minimum delegation amount for delegators.
   *
   * @param minimumDelegationAmount - Minimum amount delegators can stake
   * @returns The builder instance for method chaining
   */
  public minimumDelegationAmount(
    minimumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._minimumDelegationAmount = CLValue.newCLUint64(
      minimumDelegationAmount
    );
    return this;
  }

  /**
   * Sets the maximum delegation amount for delegators.
   *
   * @param maximumDelegationAmount - Maximum amount delegators can stake
   * @returns The builder instance for method chaining
   */
  public maximumDelegationAmount(
    maximumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._maximumDelegationAmount = CLValue.newCLUint64(
      maximumDelegationAmount
    );
    return this;
  }

  /**
   * Sets the number of reserved delegation slots.
   *
   * @param reservedSlots - Number of slots reserved for specific delegators
   * @returns The builder instance for method chaining
   */
  public reservedSlots(reservedSlots: BigNumber): NativeAddBidBuilder {
    this._reservedSlots = CLValue.newCLUInt32(reservedSlots);
    return this;
  }

  /**
   * Builds and returns the Add Bid transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    const runtimeArgs = Args.fromMap({});

    runtimeArgs.insert('public_key', this._validator);
    runtimeArgs.insert('amount', this._amount);
    runtimeArgs.insert('delegation_rate', this._delegationRate);

    if (this._minimumDelegationAmount) {
      runtimeArgs.insert(
        'minimum_delegation_amount',
        this._minimumDelegationAmount
      );
    }

    if (this._maximumDelegationAmount) {
      runtimeArgs.insert(
        'maximum_delegation_amount',
        this._maximumDelegationAmount
      );
    }

    if (this._reservedSlots) {
      runtimeArgs.insert('reserved_slots', this._reservedSlots);
    }

    this._runtimeArgs = runtimeArgs;

    return super.build();
  }

  /**
   * Builds and returns the Add Bid transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If initiator address or contract hash is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    const runtimeArgs = Args.fromMap({});

    runtimeArgs.insert('public_key', this._validator);
    runtimeArgs.insert('amount', this._amount);
    runtimeArgs.insert('delegation_rate', this._delegationRate);

    if (this._minimumDelegationAmount) {
      runtimeArgs.insert(
        'minimum_delegation_amount',
        this._minimumDelegationAmount
      );
    }

    if (this._maximumDelegationAmount) {
      runtimeArgs.insert(
        'maximum_delegation_amount',
        this._maximumDelegationAmount
      );
    }

    if (this._reservedSlots) {
      runtimeArgs.insert('reserved_slots', this._reservedSlots);
    }

    this._runtimeArgs = runtimeArgs;

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.addBid,
      runtimeArgs
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Withdraw Bid transactions.
 * Used by validators to withdraw or reduce their bid in the Casper auction system.
 *
 * @example
 * ```typescript
 * const transaction = new NativeWithdrawBidBuilder()
 *   .from(validatorPublicKey)
 *   .validator(validatorPublicKey)
 *   .amount('500000000000') // 500 CSPR
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeWithdrawBidBuilder extends TransactionBuilder<NativeWithdrawBidBuilder> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.WithdrawBid
    );
  }

  /**
   * Sets the validator's public key for the withdrawal.
   *
   * @param publicKey - The validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeWithdrawBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the amount to withdraw in motes.
   *
   * @param amount - The withdrawal amount
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeWithdrawBidBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Builds and returns the Withdraw Bid transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      public_key: this._validator,
      amount: this._amount
    });

    return super.build();
  }

  /**
   * Builds and returns the Withdraw Bid transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If contract hash cannot be determined
   */
  public buildFor1_5(): Transaction {
    this._runtimeArgs = Args.fromMap({
      public_key: this._validator,
      amount: this._amount
    });

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.withdrawBid,
      this._runtimeArgs
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Delegate transactions.
 * Allows accounts to delegate their CSPR tokens to a validator for staking.
 *
 * @example
 * ```typescript
 * const transaction = new NativeDelegateBuilder()
 *   .from(delegatorPublicKey)
 *   .validator(validatorPublicKey)
 *   .amount('500000000000') // 500 CSPR
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeDelegateBuilder extends TransactionBuilder<NativeDelegateBuilder> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Delegate
    );
  }

  /**
   * Sets the validator's public key to delegate to.
   *
   * @param publicKey - The validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeDelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the amount to delegate in motes.
   *
   * @param amount - The delegation amount (minimum varies by network)
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeDelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Builds and returns the Delegate transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   * @throws {Error} If initiator address is not specified
   */
  public build(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount
    });

    return super.build();
  }

  /**
   * Builds and returns the Delegate transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If initiator address or contract hash is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.delegate,
      Args.fromMap({
        validator: this._validator,
        delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
        amount: this._amount
      })
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Undelegate transactions.
 * Allows accounts to undelegate their staked CSPR tokens from a validator.
 *
 * @example
 * ```typescript
 * const transaction = new NativeUndelegateBuilder()
 *   .from(delegatorPublicKey)
 *   .validator(validatorPublicKey)
 *   .amount('250000000000') // 250 CSPR
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeUndelegateBuilder extends TransactionBuilder<NativeUndelegateBuilder> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Undelegate
    );
  }

  /**
   * Sets the validator's public key to undelegate from.
   *
   * @param publicKey - The validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeUndelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the amount to undelegate in motes.
   *
   * @param amount - The undelegation amount
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeUndelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Builds and returns the Undelegate transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   * @throws {Error} If initiator address is not specified
   */
  public build(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount
    });

    return super.build();
  }

  /**
   * Builds and returns the Undelegate transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If initiator address or contract hash is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.undelegate,
      Args.fromMap({
        validator: this._validator,
        delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
        amount: this._amount
      })
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Redelegate transactions.
 * Allows accounts to move their delegated stake from one validator to another
 * without waiting for the undelegation period.
 *
 * @example
 * ```typescript
 * const transaction = new NativeRedelegateBuilder()
 *   .from(delegatorPublicKey)
 *   .validator(oldValidatorPublicKey)
 *   .newValidator(newValidatorPublicKey)
 *   .amount('500000000000') // 500 CSPR
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeRedelegateBuilder extends TransactionBuilder<NativeRedelegateBuilder> {
  private _validator!: CLValue;
  private _newValidator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Redelegate
    );
  }

  /**
   * Sets the current validator's public key (the validator to redelegate from).
   *
   * @param publicKey - The current validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the new validator's public key (the validator to redelegate to).
   *
   * @param publicKey - The new validator's public key
   * @returns The builder instance for method chaining
   */
  public newValidator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._newValidator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the amount to redelegate in motes.
   *
   * @param amount - The redelegation amount
   * @returns The builder instance for method chaining
   */
  public amount(amount: BigNumber | string): NativeRedelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Builds and returns the Redelegate transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   * @throws {Error} If initiator address is not specified
   */
  public build(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount,
      new_validator: this._newValidator
    });

    return super.build();
  }

  /**
   * Builds and returns the Redelegate transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If initiator address or contract hash is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.redelegate,
      Args.fromMap({
        validator: this._validator,
        new_validator: this._newValidator,
        delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
        amount: this._amount
      })
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Activate Bid transactions.
 * Used by validators to activate their bid after it has been deactivated.
 *
 * @example
 * ```typescript
 * const transaction = new NativeActivateBidBuilder()
 *   .from(validatorPublicKey)
 *   .validator(validatorPublicKey)
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeActivateBidBuilder extends TransactionBuilder<NativeActivateBidBuilder> {
  private _validator!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ActivateBid
    );
  }

  /**
   * Sets the validator's public key to activate.
   *
   * @param publicKey - The validator's public key
   * @returns The builder instance for method chaining
   */
  public validator(publicKey: PublicKey): NativeActivateBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Builds and returns the Activate Bid transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      validator: this._validator
    });

    return super.build();
  }

  /**
   * Builds and returns the Activate Bid transaction for Casper 1.5.
   * Uses the auction manager contract for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If contract hash cannot be determined
   */
  public buildFor1_5(): Transaction {
    this._runtimeArgs = Args.fromMap({
      validator: this._validator
    });

    const contractHash =
      this._contractHash ??
      AuctionManagerContractHashMap[this._chainName as CasperNetworkName] ??
      AuctionManagerContractHashMap.casper;

    if (!contractHash) {
      throw new Error(
        `Contract hash is undefined. Check _contractHash or _chainName: ${this._chainName}`
      );
    }

    const session = new ExecutableDeployItem();
    session.storedContractByHash = new StoredContractByHash(
      ContractHash.newContract(contractHash),
      AuctionManagerEntryPoint.activateBid,
      this._runtimeArgs
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Native Change Bid Public Key transactions.
 * Allows validators to change their public key while maintaining their bid.
 *
 * @example
 * ```typescript
 * const transaction = new NativeChangeBidPublicKeyBuilder()
 *   .from(validatorPublicKey)
 *   .previousPublicKey(oldPublicKey)
 *   .newPublicKey(newPublicKey)
 *   .chainName('casper')
 *   .payment(2_500_000_000)
 *   .build();
 * ```
 */
export class NativeChangeBidPublicKeyBuilder extends TransactionBuilder<NativeChangeBidPublicKeyBuilder> {
  private _public_key!: CLValue;
  private _new_public_key!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ChangeBidPublicKey
    );
  }

  /**
   * Sets the previous (current) public key of the validator.
   *
   * @param publicKey - The validator's current public key
   * @returns The builder instance for method chaining
   */
  public previousPublicKey(
    publicKey: PublicKey
  ): NativeChangeBidPublicKeyBuilder {
    this._public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the new public key for the validator.
   *
   * @param publicKey - The validator's new public key
   * @returns The builder instance for method chaining
   */
  public newPublicKey(publicKey: PublicKey): NativeChangeBidPublicKeyBuilder {
    this._new_public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Builds and returns the Change Bid Public Key transaction for Casper 2.0+.
   *
   * @returns A complete Transaction object ready to be signed and submitted
   */
  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      public_key: this._public_key,
      new_public_key: this._new_public_key
    });

    return super.build();
  }
}

/**
 * Builder for creating Contract Call transactions.
 * Enables calling entry points on deployed smart contracts.
 * Supports multiple addressing modes: by hash, by name, by package hash, and by package name.
 *
 * @example
 * ```typescript
 * const transaction = new ContractCallBuilder()
 *   .from(callerPublicKey)
 *   .byHash(contractHash)
 *   .entryPoint('transfer')
 *   .runtimeArgs(args)
 *   .chainName('casper')
 *   .payment(3_000_000_000)
 *   .build();
 * ```
 */
export class ContractCallBuilder extends TransactionBuilder<ContractCallBuilder> {
  constructor() {
    super();
  }

  private _transactionInvocationTarget: TransactionInvocationTarget;

  /**
   * Sets the contract to call using its hash.
   *
   * @param contractHash - The contract hash in hexadecimal format
   * @returns The builder instance for method chaining
   */
  public byHash(contractHash: string): ContractCallBuilder {
    const invocationTarget = new TransactionInvocationTarget();
    invocationTarget.byHash = Hash.fromHex(contractHash);
    this._transactionInvocationTarget = invocationTarget;

    const storedTarget = new StoredTarget();
    storedTarget.id = invocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  /**
   * Sets the contract to call using its name.
   *
   * @param name - The named key under which the contract is stored
   * @returns The builder instance for method chaining
   */
  public byName(name: string): ContractCallBuilder {
    const invocationTarget = new TransactionInvocationTarget();
    invocationTarget.byName = name;
    this._transactionInvocationTarget = invocationTarget;

    const storedTarget = new StoredTarget();
    storedTarget.id = invocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  /**
   * Sets the contract to call using its package hash and optional version.
   *
   * @param contractHash - The contract package hash in hexadecimal format
   * @param version - Optional specific version of the contract to call
   * @param protocolVersionMajor - Optional protocol version major number
   * @returns The builder instance for method chaining
   */
  public byPackageHash(
    contractHash: string,
    version?: number,
    protocolVersionMajor: number | null = null
  ): ContractCallBuilder {
    const packageHashInvocationTarget = new ByPackageHashInvocationTarget();
    packageHashInvocationTarget.addr = Hash.fromHex(contractHash);
    packageHashInvocationTarget.version = version;
    packageHashInvocationTarget.protocolVersionMajor = protocolVersionMajor;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageHash = packageHashInvocationTarget;
    this._transactionInvocationTarget = transactionInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  /**
   * Sets the contract to call using its package name and optional version.
   *
   * @param name - The package name under which the contract is stored
   * @param version - Optional specific version of the contract to call
   * @param protocolVersionMajor - Optional protocol version major number
   * @returns The builder instance for method chaining
   */
  public byPackageName(
    name: string,
    version?: number,
    protocolVersionMajor: number | null = null
  ): ContractCallBuilder {
    const packageNameInvocationTarget = new ByPackageNameInvocationTarget();
    packageNameInvocationTarget.name = name;
    packageNameInvocationTarget.version = version;
    packageNameInvocationTarget.protocolVersionMajor = protocolVersionMajor;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageName = packageNameInvocationTarget;
    this._transactionInvocationTarget = transactionInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);

    return this;
  }

  /**
   * Sets the entry point name to call on the contract.
   *
   * @param name - The name of the contract entry point
   * @returns The builder instance for method chaining
   */
  public entryPoint(name: string): ContractCallBuilder {
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Custom,
      name
    );
    return this;
  }

  /**
   * Sets the runtime arguments to pass to the contract entry point.
   *
   * @param args - The arguments to pass to the contract
   * @returns The builder instance for method chaining
   */
  public runtimeArgs(args: Args): ContractCallBuilder {
    this._runtimeArgs = args;
    return this;
  }

  /**
   * Builds and returns the Contract Call transaction for Casper 1.5.
   * Uses the legacy deploy format for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If entry point is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._entryPoint.customEntryPoint) {
      throw new Error('EntryPoint is not specified');
    }

    const session = new ExecutableDeployItem();

    if (this._transactionInvocationTarget.byHash) {
      session.storedContractByHash = new StoredContractByHash(
        ContractHash.newContract(
          this._transactionInvocationTarget.byHash.toHex()
        ),
        this._entryPoint.customEntryPoint,
        this._runtimeArgs
      );
    } else if (this._transactionInvocationTarget.byPackageHash) {
      session.storedVersionedContractByHash = new StoredVersionedContractByHash(
        ContractHash.newContract(
          this._transactionInvocationTarget.byPackageHash.addr.toHex()
        ),
        this._entryPoint.customEntryPoint,
        this._runtimeArgs,
        this._transactionInvocationTarget.byPackageHash.version
      );
    } else if (this._transactionInvocationTarget.byName) {
      session.storedContractByName = new StoredContractByName(
        this._transactionInvocationTarget.byName,
        this._entryPoint.customEntryPoint,
        this._runtimeArgs
      );
    } else if (this._transactionInvocationTarget.byPackageName) {
      session.storedVersionedContractByName = new StoredVersionedContractByName(
        this._transactionInvocationTarget.byPackageName.name,
        this._entryPoint.customEntryPoint,
        this._runtimeArgs,
        this._transactionInvocationTarget.byPackageName.version
      );
    }

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

/**
 * Builder for creating Session transactions.
 * Used to deploy new smart contracts or upgrade existing ones from WebAssembly bytecode.
 *
 * @example
 * ```typescript
 * const wasmBytes = await fs.readFile('contract.wasm');
 * const transaction = new SessionBuilder()
 *   .from(deployerPublicKey)
 *   .wasm(wasmBytes)
 *   .installOrUpgrade()
 *   .runtimeArgs(args)
 *   .chainName('casper')
 *   .payment(100_000_000_000)
 *   .build();
 * ```
 */
export class SessionBuilder extends TransactionBuilder<SessionBuilder> {
  private _isInstallOrUpgrade = false;

  constructor() {
    super();
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Call
    );
  }

  /**
   * Sets the WebAssembly bytecode for the session.
   *
   * @param wasmBytes - The compiled WebAssembly contract bytecode
   * @returns The builder instance for method chaining
   */
  public wasm(wasmBytes: Uint8Array): SessionBuilder {
    const sessionTarget = new SessionTarget();
    sessionTarget.moduleBytes = wasmBytes;
    sessionTarget.isInstallUpgrade = this._isInstallOrUpgrade;
    sessionTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(
      undefined,
      undefined,
      sessionTarget
    );

    return this;
  }

  /**
   * Marks this session as an install or upgrade operation.
   * Should be called when deploying a new contract or upgrading an existing one.
   *
   * @returns The builder instance for method chaining
   */
  public installOrUpgrade(): SessionBuilder {
    this._isInstallOrUpgrade = true;
    if (this._invocationTarget?.session) {
      this._invocationTarget.session.isInstallUpgrade = true;
    }
    return this;
  }

  /**
   * Sets the runtime arguments to pass to the session.
   *
   * @param args - The arguments to pass to the contract installer
   * @returns The builder instance for method chaining
   */
  public runtimeArgs(args: Args): SessionBuilder {
    this._runtimeArgs = args;
    return this;
  }

  /**
   * Builds and returns the Session transaction for Casper 1.5.
   * Uses the legacy deploy format for backward compatibility.
   *
   * @returns A Transaction object compatible with Casper 1.5
   * @throws {Error} If WASM bytecode is not specified
   */
  public buildFor1_5(): Transaction {
    if (!this._invocationTarget.session?.moduleBytes) {
      throw new Error('EntryPoint is not specified');
    }

    const session = ExecutableDeployItem.newModuleBytes(
      this._invocationTarget.session.moduleBytes,
      this._runtimeArgs
    );

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      this._getStandardPayment(),
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}
