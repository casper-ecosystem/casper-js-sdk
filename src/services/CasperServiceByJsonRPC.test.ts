import { CasperServiceByJsonRPC } from './CasperServiceByJsonRPC';
import { Ed25519 } from '../lib/Keys';

describe('CasperServiceByJsonRPC', () => {
  it('should validate bool value and create bool Argument', async () => {
    const casperService = new CasperServiceByJsonRPC(
      'http://192.168.2.166:7777/rpc'
    );
    // const status = await casperService.getLatestBlockInfo();
    const re = await casperService.getLatestBlockInfo();
    console.log(re.block!.header.system_transactions);
    const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(
      re.block!.hash,
      Ed25519.new().publicKey
    );
    const balance = await casperService.getAccountBalance(
      re.block!.hash,
      balanceUref
    );
    console.log(balance);
  });
});
