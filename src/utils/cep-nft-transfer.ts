import {
  Args,
  CLTypeUInt256,
  CLValue,
  CLValueBool,
  CLValueList,
  CLValueUInt256,
  CLValueUInt64,
  ContractHash,
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  Key,
  KeyTypeID,
  PublicKey,
  StoredVersionedContractByHash
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
  tokenHash
}: IMakeNftTransferDeployParams): Deploy => {
  const senderPublicKey = PublicKey.newPublicKey(senderPublicKeyHex);

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

  if (!args) {
    throw new Error('Deploy arguments error. Check provided token data');
  }

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

  return Deploy.makeDeploy(deployHeader, payment, session);
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
    runtimeArgs.insert(
      'is_hash_identifier_mode',
      CLValueBool.newCLValueBool(false)
    );
    runtimeArgs.insert('token_id', CLValueUInt64.newCLUint64(tokenId));
  }

  if (tokenHash) {
    runtimeArgs.insert(
      'is_hash_identifier_mode',
      CLValueBool.newCLValueBool(true)
    );
    runtimeArgs.insert('token_id', CLValueUInt64.newCLUint64(tokenHash));
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
    token_ids: CLValueList.newCLList(CLTypeUInt256, [
      CLValueUInt256.newCLUInt256(tokenId)
    ])
  });
}
