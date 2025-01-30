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
import { AuctionManagerEntryPoint, CasperNetworkName } from '../@types';

/**
 * Abstract base class for building Transaction V1 instances.
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
   */
  public from(publicKey: PublicKey): T {
    this._initiatorAddr = new InitiatorAddr(publicKey);
    return (this as unknown) as T;
  }

  /**
   * Sets the initiator address using an account hash.
   */
  public fromAccountHash(accountHashKey: AccountHash): T {
    this._initiatorAddr = new InitiatorAddr(undefined, accountHashKey);
    return (this as unknown) as T;
  }

  /**
   * Sets the chain name for the transaction.
   */
  public chainName(chainName: string): T {
    this._chainName = chainName;
    return (this as unknown) as T;
  }

  /**
   * Sets the contract hash for the transaction.
   */
  public contractHash(contractHash: string): T {
    this._contractHash = contractHash;
    return (this as unknown) as T;
  }

  /**
   * Sets the timestamp for the transaction.
   */
  public timestamp(timestamp: Timestamp): T {
    this._timestamp = timestamp;
    return (this as unknown) as T;
  }

  /**
   * Sets the time-to-live for the transaction.
   */
  public ttl(ttl: number): T {
    this._ttl = new Duration(ttl);
    return (this as unknown) as T;
  }

  /**
   * Sets the payment amount for the transaction.
   */
  public payment(paymentAmount: number): T {
    const pricingMode = new PricingMode();
    const paymentLimited = new PaymentLimitedMode();
    paymentLimited.standardPayment = true;
    paymentLimited.paymentAmount = paymentAmount;
    paymentLimited.gasPriceTolerance = 1;

    pricingMode.paymentLimited = paymentLimited;
    this._pricingMode = pricingMode;
    return (this as unknown) as T;
  }

  protected _getDefaultDeployHeader(): DeployHeader {
    const deployHeader = DeployHeader.default();
    deployHeader.account = this._initiatorAddr.publicKey;
    deployHeader.chainName = this._chainName;
    deployHeader.ttl = this._ttl;

    return deployHeader;
  }

  protected _getStandardPayment(): ExecutableDeployItem {
    if (!this._pricingMode.paymentLimited?.paymentAmount) {
      throw new Error('PaymentAmount is not specified');
    }

    return ExecutableDeployItem.standardPayment(
      this._pricingMode.paymentLimited.paymentAmount.toString()
    );
  }

  /**
   * Builds and returns the Transaction instance.
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
 */
export class NativeTransferBuilder extends TransactionBuilder<
  NativeTransferBuilder
> {
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
   */
  public target(publicKey: PublicKey): NativeTransferBuilder {
    this._publicKey = publicKey;
    this._target = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the target account hash for the transfer.
   */
  public targetAccountHash(accountHashKey: AccountHash): NativeTransferBuilder {
    this._target = CLValue.newCLByteArray(accountHashKey.toBytes());
    return this;
  }

  /**
   * Sets the amount to transfer.
   */
  public amount(amount: BigNumber | string): NativeTransferBuilder {
    this._amountRow = amount;
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  /**
   * Sets the transfer ID.
   */
  public id(id: number): NativeTransferBuilder {
    this._idTransfer = id;
    return this;
  }

  /**
   * Builds and returns the Native Transfer transaction.
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
   * Builds and returns the Native Transfer transaction.
   */
  public buildFor1_5(): Transaction {
    const session = new ExecutableDeployItem();
    session.transfer = TransferDeployItem.newTransfer(
      this._amountRow,
      this._publicKey,
      undefined,
      this._idTransfer
    );

    const payment = ExecutableDeployItem.standardPayment('100000000');

    const deploy = Deploy.makeDeploy(
      this._getDefaultDeployHeader(),
      payment,
      session
    );

    return Transaction.fromDeploy(deploy);
  }
}

export class NativeAddBidBuilder extends TransactionBuilder<
  NativeAddBidBuilder
> {
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

  public validator(publicKey: PublicKey): NativeAddBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeAddBidBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  public delegationRate(delegationRate: number): NativeAddBidBuilder {
    this._delegationRate = CLValue.newCLUint8(delegationRate);
    return this;
  }

  public minimumDelegationAmount(
    minimumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._minimumDelegationAmount = CLValue.newCLUint64(
      minimumDelegationAmount
    );
    return this;
  }

  public maximumDelegationAmount(
    maximumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._maximumDelegationAmount = CLValue.newCLUint64(
      maximumDelegationAmount
    );
    return this;
  }

  public reservedSlots(reservedSlots: BigNumber): NativeAddBidBuilder {
    this._reservedSlots = CLValue.newCLUInt32(reservedSlots);
    return this;
  }

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

export class NativeWithdrawBidBuilder extends TransactionBuilder<
  NativeWithdrawBidBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.WithdrawBid
    );
  }

  public validator(publicKey: PublicKey): NativeWithdrawBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeWithdrawBidBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      public_key: this._validator,
      amount: this._amount
    });

    return super.build();
  }

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

export class NativeDelegateBuilder extends TransactionBuilder<
  NativeDelegateBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Delegate
    );
  }

  public validator(publicKey: PublicKey): NativeDelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeDelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

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

export class NativeUndelegateBuilder extends TransactionBuilder<
  NativeUndelegateBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValue.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Undelegate
    );
  }

  public validator(publicKey: PublicKey): NativeUndelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeUndelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

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

export class NativeRedelegateBuilder extends TransactionBuilder<
  NativeRedelegateBuilder
> {
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

  public validator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public newValidator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._newValidator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeRedelegateBuilder {
    this._amount = CLValue.newCLUInt512(amount);
    return this;
  }

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

export class NativeActivateBidBuilder extends TransactionBuilder<
  NativeActivateBidBuilder
> {
  private _validator!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ActivateBid
    );
  }

  public validator(publicKey: PublicKey): NativeActivateBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      validator: this._validator
    });

    return super.build();
  }

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

export class NativeChangeBidPublicKeyBuilder extends TransactionBuilder<
  NativeChangeBidPublicKeyBuilder
> {
  private _public_key!: CLValue;
  private _new_public_key!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ChangeBidPublicKey
    );
  }

  public previousPublicKey(
    publicKey: PublicKey
  ): NativeChangeBidPublicKeyBuilder {
    this._public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public newPublicKey(publicKey: PublicKey): NativeChangeBidPublicKeyBuilder {
    this._new_public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public build(): Transaction {
    this._runtimeArgs = Args.fromMap({
      public_key: this._public_key,
      new_public_key: this._new_public_key
    });

    return super.build();
  }
}

export class ContractCallBuilder extends TransactionBuilder<
  ContractCallBuilder
> {
  constructor() {
    super();
  }

  private _transactionInvocationTarget: TransactionInvocationTarget;

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

  public byPackageHash(
    contractHash: string,
    version?: number
  ): ContractCallBuilder {
    const packageHashInvocationTarget = new ByPackageHashInvocationTarget();
    packageHashInvocationTarget.addr = Hash.fromHex(contractHash);
    packageHashInvocationTarget.version = version;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageHash = packageHashInvocationTarget;
    this._transactionInvocationTarget = transactionInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  public byPackageName(name: string, version?: number): ContractCallBuilder {
    const packageNameInvocationTarget = new ByPackageNameInvocationTarget();
    packageNameInvocationTarget.name = name;
    packageNameInvocationTarget.version = version;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageName = packageNameInvocationTarget;
    this._transactionInvocationTarget = transactionInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);

    return this;
  }

  public entryPoint(name: string): ContractCallBuilder {
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Custom,
      name
    );
    return this;
  }

  public runtimeArgs(args: Args): ContractCallBuilder {
    this._runtimeArgs = args;
    return this;
  }

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

export class SessionBuilder extends TransactionBuilder<SessionBuilder> {
  private _isInstallOrUpgrade = false;

  constructor() {
    super();
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Call
    );
  }

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

  public installOrUpgrade(): SessionBuilder {
    this._isInstallOrUpgrade = true;
    if (this._invocationTarget?.session) {
      this._invocationTarget.session.isInstallUpgrade = true;
    }
    return this;
  }

  public runtimeArgs(args: Args): SessionBuilder {
    this._runtimeArgs = args;
    return this;
  }

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
