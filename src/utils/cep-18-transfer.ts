import {
  Args,
  CLValue,
  CLValueUInt256,
  ContractHash,
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  Key,
  KeyTypeID,
  PublicKey,
  StoredContractByHash
} from '../types';
import { CasperNetworkName } from '../@types';

export interface IMakeCep18TransferDeployParams {
  contractHash: string;
  senderPublicKeyHex: string;
  recipientPublicKeyHex: string;
  transferAmount: string;
  paymentAmount: string;
  chainName?: string;
  ttl?: number;
}

/**
 * This function generates a `Deploy` for transferring CEP-18 from one account to another.
 *
 * @param params - The parameters required to create the CEP-18 transfer deploy.
 * @param params.contractHash - The hash of the contract to interact with.
 *                              This is a 64-character hexadecimal string representing the contract.
 * @param params.senderPublicKeyHex - The sender's public key in hexadecimal format.
 * @param params.recipientPublicKeyHex - The recipient's public key in hexadecimal format.
 * @param params.transferAmount - The amount of CSPR to transfer.
 *                                This value must be represented in its smallest unit (motes).
 *                                For example, to transfer 2.5 CSPR, provide the value `2500000000` (2.5 * 10^9 motes).
 * @param params.paymentAmount - The amount of CSPR to pay a network fee.
 *                               This value must be represented in its smallest unit (motes).
 * @param params.chainName - (Optional) The name of the Casper network chain.
 *                           Defaults to `'CasperNetworkName.Mainnet'` if not specified.
 * @param params.ttl - (Optional) The time-to-live (TTL) for the `Deploy` in milliseconds.
 *                      Specifies how long the `Deploy` is valid before it expires.
 *                      Defaults 1800000 (30 minutes)
 * @returns A promise that resolves to the created Deploy instance, ready to be sent to the Casper network.
 *
 * @example
 * ```ts
 * import { makeCsprTransferDeploy } from 'casper-js-sdk';
 *
 * const deploy = await makeCep18TransferDeploy({
 *   contractHash: '0123456789asdfbcdef...',
 *   senderPublicKeyHex: '0123456789asdfbcdef...',
 *   recipientPublicKeyHex: '0123456789abcdef...',
 *   transferAmount: '25000000000', // 25 CEP-18 with 9 decimals
 *   paymentAmount: '3000000000', // 3 CSPR
 * });
 *
 * console.log('Created Deploy:', deploy);
 * ```
 */

export const makeCep18TransferDeploy = ({
  contractHash,
  senderPublicKeyHex,
  recipientPublicKeyHex,
  transferAmount,
  paymentAmount,
  chainName = CasperNetworkName.Mainnet,
  ttl = DEFAULT_DEPLOY_TTL
}: IMakeCep18TransferDeployParams): Deploy => {
  const senderPublicKey = PublicKey.newPublicKey(senderPublicKeyHex);
  const recipientPublicKey = PublicKey.newPublicKey(recipientPublicKeyHex);

  const session = new ExecutableDeployItem();

  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(contractHash),
    'transfer',
    Args.fromMap({
      recipient: CLValue.newCLKey(
        Key.createByType(
          recipientPublicKey.accountHash().toPrefixedString(),
          KeyTypeID.Account
        )
      ),
      amount: CLValueUInt256.newCLUInt256(transferAmount)
    })
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);

  const deployHeader = DeployHeader.default();
  deployHeader.account = senderPublicKey;
  deployHeader.chainName = chainName;
  deployHeader.ttl = new Duration(ttl);

  return Deploy.makeDeploy(deployHeader, payment, session);
};
