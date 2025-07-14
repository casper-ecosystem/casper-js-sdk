import {
  Args,
  CLTypeUInt256,
  CLValue,
  ContractCallBuilder,
  ContractHash,
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  Key,
  KeyTypeID,
  PublicKey,
  StoredVersionedContractByHash,
  Timestamp,
  Transaction
} from '../types';
import { CasperNetworkName, NFTTokenStandard } from '../@types';

export interface IMakeNftTransferDeployParams {
  nftStandard: NFTTokenStandard;
  contractPackageHash: string;
  senderPublicKeyHex: string;
  recipientPublicKeyHex: string;
  paymentAmount: string;
  chainName?: string;
  ttl?: number;
  tokenId?: string;
  tokenHash?: string;
  timestamp?: string;
  gasPrice?: number;
}

/**
 * Creates a `Deploy` for transferring an NFT (Non-Fungible Token).
 * This function constructs and returns a `Deploy` for transferring NFTs according to the specified parameters.
 *
 * @param params - The parameters required to create the NFT transfer deploy.
 * @param params.nftStandard - The NFT standard being used (e.g., CEP-78, CEP-47).
 * @param params.contractPackageHash - The hash of the contract package to interact with.
 * @param params.senderPublicKeyHex - The sender's public key in hexadecimal format.
 * @param params.recipientPublicKeyHex - The recipient's public key in hexadecimal format.
 * @param params.paymentAmount - The payment amount for the transaction, specified in motes.
 * @param params.chainName - The name of the Casper network chain (e.g., "casper", "casper-test"). Defaults to Mainnet.
 * @param params.ttl - The time-to-live (TTL) for the deploy in milliseconds. Defaults to the constant `DEFAULT_DEPLOY_TTL`.
 * @param params.tokenId - The ID of the token to transfer. Optional and used if the standard requires it.
 * @param params.tokenHash - The hash of the token to transfer. Optional and used if the standard requires it.
 * @param params.timestamp - (Optional) The timestamp in ISO 8601 format
 *
 * @returns A deploy object representing the NFT transfer operation.
 *
 * @example
 * ```ts
 * import { makeNftTransferDeploy, NFTTokenStandard } from 'casper-js-sdk';
 *
 * const deploy = await makeNftTransferDeploy({
 *   nftStandard: NFTTokenStandard.CEP47,
 *   contractPackageHash: '0123456789asdfbcdef...',
 *   senderPublicKeyHex: '0123456789asdfbcdef...',
 *   recipientPublicKeyHex: '0123456789abcdef...',
 *   paymentAmount: '3000000000', // 3 CSPR
 *   tokenId: 234,
 * });
 *
 * console.log('Created Deploy:', deploy);
 * ```
 */
export const makeNftTransferDeploy = ({
  nftStandard,
  contractPackageHash,
  senderPublicKeyHex,
  recipientPublicKeyHex,
  paymentAmount,
  chainName = CasperNetworkName.Mainnet,
  ttl = DEFAULT_DEPLOY_TTL,
  tokenId,
  tokenHash,
  timestamp,
  gasPrice = 1
}: IMakeNftTransferDeployParams): Deploy => {
  const senderPublicKey = PublicKey.newPublicKey(senderPublicKeyHex);

  const args = getRuntimeArgsForNftTransfer({
    nftStandard,
    recipientPublicKeyHex,
    senderPublicKeyHex,
    tokenHash,
    tokenId
  });

  const session = new ExecutableDeployItem();

  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    ContractHash.newContract(contractPackageHash),
    'transfer',
    args
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);

  const deployHeader = DeployHeader.default();
  deployHeader.account = senderPublicKey;
  deployHeader.chainName = chainName;
  deployHeader.ttl = new Duration(ttl);
  deployHeader.gasPrice = gasPrice;

  if (timestamp) {
    deployHeader.timestamp = Timestamp.fromJSON(timestamp);
  }

  return Deploy.makeDeploy(deployHeader, payment, session);
};

interface IMakeNftTransferTransactionParams
  extends IMakeNftTransferDeployParams {
  casperNetworkApiVersion: string;
}

export const makeNftTransferTransaction = ({
  nftStandard,
  contractPackageHash,
  senderPublicKeyHex,
  recipientPublicKeyHex,
  paymentAmount,
  chainName = CasperNetworkName.Mainnet,
  ttl = DEFAULT_DEPLOY_TTL,
  tokenId,
  tokenHash,
  timestamp,
  casperNetworkApiVersion,
  gasPrice = 1
}: IMakeNftTransferTransactionParams): Transaction => {
  if (casperNetworkApiVersion.startsWith('2.')) {
    let txBuilder = new ContractCallBuilder()
      .byPackageHash(contractPackageHash)
      .entryPoint(nftStandard === NFTTokenStandard.CEP95 ? 'transfer_from' : 'transfer')
      .from(PublicKey.fromHex(senderPublicKeyHex))
      .chainName(chainName)
      .ttl(ttl)
      .payment(Number(paymentAmount), gasPrice)
      .runtimeArgs(
        getRuntimeArgsForNftTransfer({
          nftStandard,
          recipientPublicKeyHex,
          senderPublicKeyHex,
          tokenHash,
          tokenId
        })
      );

    if (timestamp) {
      txBuilder = txBuilder.timestamp(Timestamp.fromJSON(timestamp));
    }

    return txBuilder.build();
  } else {
    return Transaction.fromDeploy(
      makeNftTransferDeploy({
        nftStandard,
        contractPackageHash,
        senderPublicKeyHex,
        recipientPublicKeyHex,
        paymentAmount,
        chainName,
        ttl,
        tokenId,
        tokenHash,
        timestamp
      })
    );
  }
};

export const getRuntimeArgsForNftTransfer = ({
  nftStandard,
  senderPublicKeyHex,
  recipientPublicKeyHex,
  tokenId,
  tokenHash
}: Pick<
  IMakeNftTransferDeployParams,
  | 'nftStandard'
  | 'senderPublicKeyHex'
  | 'recipientPublicKeyHex'
  | 'tokenId'
  | 'tokenHash'
>): Args => {
  if (!(tokenId || tokenHash)) {
    throw new Error('Specify either tokenId or tokenHash to make a transfer');
  }

  let args: Args | null = null;

  if (nftStandard === NFTTokenStandard.CEP47) {
    if (!tokenId) {
      throw new Error('TokenId is required for CEP-47 transfer');
    }

    args = getRuntimeArgsForCep47Transfer({ tokenId, recipientPublicKeyHex });
  }

  if (nftStandard === NFTTokenStandard.CEP78) {
    args = getRuntimeArgsForCep78Transfer({
      tokenId,
      tokenHash,
      senderPublicKeyHex,
      recipientPublicKeyHex
    });
  }

  if (nftStandard === NFTTokenStandard.CEP95) {
    if (!tokenId) {
      throw new Error('TokenId is required for CEP-95 transfer');
    }

    args = getRuntimeArgsForCep95Transfer({ tokenId, recipientPublicKeyHex, senderPublicKeyHex });
  }

  if (!args) {
    throw new Error('Arguments error. Check provided token data');
  }

  return args;
};

export const getRuntimeArgsForCep78Transfer = ({
  tokenHash,
  tokenId,
  recipientPublicKeyHex,
  senderPublicKeyHex
}: Pick<
  IMakeNftTransferDeployParams,
  'tokenId' | 'recipientPublicKeyHex' | 'tokenHash' | 'senderPublicKeyHex'
>) => {
  const runtimeArgs = Args.fromMap({
    target_key: CLValue.newCLKey(
      Key.createByType(
        PublicKey.fromHex(recipientPublicKeyHex)
          .accountHash()
          .toPrefixedString(),
        KeyTypeID.Account
      )
    ),
    source_key: CLValue.newCLKey(
      Key.createByType(
        PublicKey.fromHex(senderPublicKeyHex)
          .accountHash()
          .toPrefixedString(),
        KeyTypeID.Account
      )
    )
  });

  if (tokenId) {
    try {
      runtimeArgs.insert(
        'is_hash_identifier_mode',
        CLValue.newCLValueBool(false)
      );
      runtimeArgs.insert('token_id', CLValue.newCLUint64(tokenId));
    } catch {
      throw new Error('Invalid "tokenId" value. It should be uint64. Consider to use "tokenHash" param')
    }
  }

  if (tokenHash) {
    runtimeArgs.insert('is_hash_identifier_mode', CLValue.newCLValueBool(true));
    runtimeArgs.insert('token_hash', CLValue.newCLString(tokenHash));
  }

  return runtimeArgs;
};

export function getRuntimeArgsForCep47Transfer({
  tokenId,
  recipientPublicKeyHex
}: Required<
  Pick<IMakeNftTransferDeployParams, 'tokenId' | 'recipientPublicKeyHex'>
>) {
  return Args.fromMap({
    recipient: CLValue.newCLKey(
      Key.createByType(
        PublicKey.fromHex(recipientPublicKeyHex)
          .accountHash()
          .toPrefixedString(),
        KeyTypeID.Account
      )
    ),
    token_ids: CLValue.newCLList(CLTypeUInt256, [CLValue.newCLUInt256(tokenId)])
  });
}

export function getRuntimeArgsForCep95Transfer({
  tokenId,
  recipientPublicKeyHex,
  senderPublicKeyHex,
}: Required<
  Pick<IMakeNftTransferDeployParams, 'tokenId' | 'recipientPublicKeyHex' | 'senderPublicKeyHex'>
>) {
  return Args.fromMap({
    from: CLValue.newCLKey(
      Key.createByType(
        PublicKey.fromHex(senderPublicKeyHex)
          .accountHash()
          .toPrefixedString(),
        KeyTypeID.Account
      )
    ),
    to: CLValue.newCLKey(
      Key.createByType(
        PublicKey.fromHex(recipientPublicKeyHex)
          .accountHash()
          .toPrefixedString(),
        KeyTypeID.Account
      )
    ),
    token_id: CLValue.newCLUInt256(tokenId),
    data: CLValue.newCLOption(null),
  });
}
