import {
  Args,
  CLValue,
  ContractHash,
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  PublicKey,
  StoredContractByHash
} from '../types';
import { AuctionManagerEntryPoint, CasperNetworkName } from '../@types';
import { AuctionManagerContractHashMap } from './constants';

export interface IMakeAuctionManagerDeployParams {
  contractEntryPoint:
    | AuctionManagerEntryPoint.delegate
    | AuctionManagerEntryPoint.undelegate
    | AuctionManagerEntryPoint.redelegate;
  delegatorPublicKeyHex: string;
  validatorPublicKeyHex: string;
  newValidatorPublicKeyHex?: string;
  amount: string;
  paymentAmount?: string;
  chainName?: CasperNetworkName;
  ttl?: number;
  contractHash?: string;
}

/**
 * Creates a `Deploy` for the Auction Manager contract.
 *
 * This function generates a `Deploy` that interacts with the Auction Manager
 * contract on the Casper network. It supports operations such as delegation,
 * un-delegation, and validator change management.
 *
 * @param params - The parameters required to create the Auction Manager deploy.
 * @param params.contractEntryPoint - The entry point to invoke in the Auction Manager contract.
 * @param params.delegatorPublicKeyHex - The delegator's public key in hexadecimal format.
 * @param params.validatorPublicKeyHex - The validator's public key in hexadecimal format.
 * @param params.newValidatorPublicKeyHex - (Optional) The new validator's public key in hexadecimal format (used in validator change operations).
 * @param params.amount - The amount of CSPR to delegate/undelegate/redelegate.
 *                        This value must be represented in its smallest unit (motes).
 *                        For example, to transfer 2.5 CSPR, provide the value `2500000000` (2.5 * 10^9 motes).
 * @param params.paymentAmount - The amount of CSPR to pay a network fee.
 *                        This value must be represented in its smallest unit (motes).
 *                        For example, to transfer 2.5 CSPR, provide the value `2500000000` (2.5 * 10^9 motes).
 * @param params.chainName - (Optional) The name of the Casper network chain - {CasperNetworkName}.
 *                           Must be either `'casper'` (mainnet) or `'casper-test'` (testnet).
 *                           Defaults to `'CasperNetworkName.Mainnet'` if not specified.
 * @param params.ttl - (Optional) The time-to-live (TTL) for the `Deploy` in milliseconds.
 *                      Specifies how long the `Deploy` is valid before it expires.
 *                      Defaults 1800000 (30 minutes)
 *
 * @returns A deploy object that can be signed and sent to the network.
 *
 * @throws {Error} Throws an error if required parameters are missing or invalid.
 *
 * @example
 * ```ts
 * import { makeAuctionManagerDeploy, AuctionManagerEntryPoint } from 'casper-js-sdk';
 *
 * const deploy = makeAuctionManagerDeploy({
 *   contractEntryPoint: AuctionManagerEntryPoint.delegate,
 *   delegatorPublicKeyHex: "0123456789abcdef...",
 *   validatorPublicKeyHex: "0123456789awedef...",
 *   amount: "500000000000",
 * });
 * ```
 */
export const makeAuctionManagerDeploy = ({
  delegatorPublicKeyHex,
  validatorPublicKeyHex,
  contractEntryPoint,
  amount,
  paymentAmount = '2500000000',
  chainName = CasperNetworkName.Mainnet,
  newValidatorPublicKeyHex,
  ttl = DEFAULT_DEPLOY_TTL,
  contractHash
}: IMakeAuctionManagerDeployParams) => {
  const delegatorPublicKey = PublicKey.newPublicKey(delegatorPublicKeyHex);
  const validatorPublicKey = PublicKey.newPublicKey(validatorPublicKeyHex);
  const newValidatorValidatorPublicKey = newValidatorPublicKeyHex
    ? PublicKey.newPublicKey(newValidatorPublicKeyHex)
    : null;
  const auctionContractHash =
    contractHash ?? AuctionManagerContractHashMap[chainName];

  if (!auctionContractHash) {
    throw new Error(
      `Auction contract hash is undefined for chain: ${chainName}`
    );
  }

  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(auctionContractHash),
    contractEntryPoint,
    Args.fromMap({
      validator: CLValue.newCLPublicKey(validatorPublicKey),
      delegator: CLValue.newCLPublicKey(delegatorPublicKey),
      amount: CLValue.newCLUInt512(amount),
      ...(newValidatorValidatorPublicKey
        ? {
            new_validator: CLValue.newCLPublicKey(
              newValidatorValidatorPublicKey
            )
          }
        : {})
    })
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);

  const deployHeader = DeployHeader.default();
  deployHeader.account = delegatorPublicKey;
  deployHeader.chainName = chainName;
  deployHeader.ttl = new Duration(ttl);

  return Deploy.makeDeploy(deployHeader, payment, session);
};
