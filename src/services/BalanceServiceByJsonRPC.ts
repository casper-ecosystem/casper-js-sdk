/**
 * A service to query balance for accounts
 */
import { CasperServiceByJsonRPC } from './CasperServiceByJsonRPC';
import { CLPublicKey } from '../lib';
import { BigNumber } from '@ethersproject/bignumber';

export class BalanceServiceByJsonRPC {
  private balanceUrefs = new Map<string, string>();

  constructor(private casperService: CasperServiceByJsonRPC) {
    console.log(
      `This class is deprecated and will be removed in the future release`
    );
  }

  /**
   * Query balance for the specified account
   *
   * It will cache balance URef values for accounts so that on subsequent queries,
   * it only takes 1 state query not 4 to get the value.
   * @param blockHashBase16
   * @param publicKey
   */
  public async getAccountBalance(
    blockHashBase16: string,
    publicKey: CLPublicKey
  ): Promise<BigNumber | undefined> {
    try {
      const stateRootHash = await this.casperService.getStateRootHash(
        blockHashBase16
      );
      let balanceUref = this.balanceUrefs.get(publicKey.toHex());

      // Find the balance Uref and cache it if we don't have it.
      if (!balanceUref) {
        balanceUref = await this.casperService.getAccountBalanceUrefByPublicKey(
          stateRootHash,
          publicKey
        );
        if (balanceUref) {
          this.balanceUrefs.set(publicKey.toHex(), balanceUref);
        }
      }

      if (!balanceUref) {
        return undefined;
      }

      return await this.casperService.getAccountBalance(
        stateRootHash,
        balanceUref
      );
    } catch (e) {
      return undefined;
    }
  }
}
