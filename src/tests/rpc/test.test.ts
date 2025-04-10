import { InfoGetTransactionResult } from '../../rpc';
import myJson from './my.json';

describe('New', () => {
  try {
    const tx = InfoGetTransactionResult.fromJSON(myJson);
    console.log(tx);
  } catch (e) {
    console.error(e);
  }
});
