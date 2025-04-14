import { BigNumber } from '@ethersproject/bignumber';

import {
  InfoGetTransactionResult,
  PutDeployResult,
  PutTransactionResult,
  RpcClient
} from '../rpc';
import {
  Args,
  CLValue,
  ContractCallBuilder,
  NativeDelegateBuilder,
  NativeRedelegateBuilder,
  NativeTransferBuilder,
  NativeUndelegateBuilder,
  PublicKey,
  SessionBuilder,
  Transaction,
  TransactionHash,
  Hash
} from '../types';
import { ErrorCode } from '../@types';

export class CasperNetwork {
  private rpcClient: RpcClient;
  private apiVersion: number;

  constructor(rpcClient: RpcClient, apiVersion: number) {
    this.rpcClient = rpcClient;
    this.apiVersion = apiVersion;
  }

  public static async create(
    rpcClient: RpcClient,
    apiVersion?: number
  ): Promise<CasperNetwork> {
    if (!apiVersion) {
      const status = await rpcClient.getStatus();

      apiVersion = status.apiVersion.startsWith('2.') ? 2 : 1;
    }

    return new CasperNetwork(rpcClient, apiVersion);
  }

  public createDelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string,
    gasPriceTolerance?: number
  ): Transaction {
    if (this.apiVersion === 2) {
      return new NativeDelegateBuilder()
        .validator(validatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost, gasPriceTolerance)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('delegate')
        .payment(deployCost, gasPriceTolerance)
        .chainName(networkName)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValue.newCLUInt512(amountMotes)
          })
        )
        .ttl(ttl)
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createUndelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string,
    gasPriceTolerance?: number
  ): Transaction {
    if (this.apiVersion === 2) {
      return new NativeUndelegateBuilder()
        .validator(validatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost, gasPriceTolerance)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('undelegate')
        .chainName(networkName)
        .payment(deployCost, gasPriceTolerance)
        .ttl(ttl)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValue.newCLUInt512(amountMotes)
          })
        )
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createRedelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    newValidatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string,
    gasPriceTolerance?: number
  ): Transaction {
    if (this.apiVersion === 2) {
      return new NativeRedelegateBuilder()
        .validator(validatorPublicKey)
        .newValidator(newValidatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost, gasPriceTolerance)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('redelegate')
        .chainName(networkName)
        .payment(deployCost, gasPriceTolerance)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValue.newCLUInt512(amountMotes),
            ...(newValidatorPublicKey
              ? {
                  new_validator: CLValue.newCLPublicKey(newValidatorPublicKey)
                }
              : {})
          })
        )
        .ttl(ttl)
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createTransferTransaction(
    senderPublicKey: PublicKey,
    recipientPublicKey: PublicKey,
    networkName: string,
    amountMotes: string,
    deployCost: number,
    ttl: number,
    id: number,
    gasPriceTolerance?: number
  ): Transaction {
    const transferBuilder = new NativeTransferBuilder()
      .from(senderPublicKey)
      .target(recipientPublicKey)
      .amount(amountMotes)
      .chainName(networkName)
      .payment(deployCost, gasPriceTolerance)
      .ttl(ttl)
      .id(id);
    if (this.apiVersion === 2) {
      return transferBuilder.build();
    }

    return transferBuilder.buildFor1_5();
  }

  public createContractCallTransaction(
    senderPublicKey: PublicKey,
    contractHash: string,
    entryPoint: string,
    networkName: string,
    deployCost: number,
    ttl: number,
    args: Args,
    gasPriceTolerance?: number
  ): Transaction {
    const contractCall = new ContractCallBuilder()
      .byHash(contractHash)
      .from(senderPublicKey)
      .entryPoint(entryPoint)
      .chainName(networkName)
      .runtimeArgs(args)
      .ttl(ttl)
      .payment(deployCost, gasPriceTolerance);

    if (this.apiVersion === 2) {
      return contractCall.build();
    }

    return contractCall.buildFor1_5();
  }

  public createContractPackageCallTransaction(
    senderPublicKey: PublicKey,
    contractPackageHash: string,
    entryPoint: string,
    networkName: string,
    deployCost: number,
    args: Args,
    ttl: number,
    contractVersion?: number,
    gasPriceTolerance?: number
  ): Transaction {
    const contractCall = new ContractCallBuilder()
      .byPackageHash(contractPackageHash, contractVersion)
      .from(senderPublicKey)
      .entryPoint(entryPoint)
      .chainName(networkName)
      .runtimeArgs(args)
      .ttl(ttl)
      .payment(deployCost, gasPriceTolerance);

    if (this.apiVersion === 2) {
      return contractCall.build();
    }

    return contractCall.buildFor1_5();
  }

  public createSessionWasmTransaction(
    senderPublicKey: PublicKey,
    networkName: string,
    deployCost: number,
    ttl: number,
    bytes: Uint8Array,
    args: Args,
    gasPriceTolerance?: number
  ): Transaction {
    const sessionWasm = new SessionBuilder()
      .from(senderPublicKey)
      .chainName(networkName)
      .payment(deployCost, gasPriceTolerance)
      .ttl(ttl)
      .wasm(bytes)
      .runtimeArgs(args);

    if (this.apiVersion === 2) {
      return sessionWasm.build();
    }

    return sessionWasm.buildFor1_5();
  }

  public async putTransaction(
    transaction: Transaction
  ): Promise<PutTransactionResult | PutDeployResult> {
    if (this.apiVersion == 2) {
      return await this.rpcClient.putTransaction(transaction);
    }

    const deploy = transaction.getDeploy();
    if (deploy) {
      return await this.rpcClient.putDeploy(deploy);
    }

    return Promise.reject(
      'Legacy deploy transaction is required when submitting to Casper Network 1.5'
    );
  }

  public async getTransaction(
    hash: TransactionHash | Hash | string
  ): Promise<InfoGetTransactionResult> {
    if (typeof hash === 'string') {
      hash = Hash.fromHex(hash);
    }

    if (this.apiVersion === 2) {
      return await this.getTransactionOnCasper2x(hash);
    }

    return await this.getTransactionOnCasper1x(hash);
  }

  private async getTransactionOnCasper2x(
    hash: TransactionHash | Hash
  ): Promise<InfoGetTransactionResult> {
    if (hash instanceof TransactionHash) {
      if (hash.transactionV1) {
        return await this.rpcClient.getTransactionByTransactionHash(
          hash.transactionV1.toHex()
        );
      }
      if (hash.deploy) {
        return await this.rpcClient.getTransactionByDeployHash(
          hash.deploy.toHex()
        );
      }
    }

    // For unknown hash types, try fetching by transaction hash first, then fallback to deploy hash
    try {
      return await this.rpcClient.getTransactionByTransactionHash(hash.toHex());
    } catch (error) {
      if (error?.statusCode === ErrorCode.NoSuchTransaction) {
        return await this.rpcClient.getTransactionByDeployHash(hash.toHex());
      }
      throw error;
    }
  }

  private async getTransactionOnCasper1x(
    hash: TransactionHash | Hash
  ): Promise<InfoGetTransactionResult> {
    const getDeployResult = await this.rpcClient.getDeploy(hash.toHex());
    return getDeployResult.toInfoGetTransactionResult();
  }
}
