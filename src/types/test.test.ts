import { Transaction, TransactionV1 } from './Transaction';
import { addReservationTransactionJson } from '../tests';
import { Deploy } from './Deploy';

describe('d', () => {
  const tx = TransactionV1.fromJSON(addReservationTransactionJson.transaction);
  const tx1 = Transaction.fromTransactionV1(tx);
  const deploy = Deploy.newDeployFromTransaction(tx1);

  console.log(tx.hash.toHex());
  console.log(JSON.stringify(Deploy.toJSON(deploy), null, 2));
});
