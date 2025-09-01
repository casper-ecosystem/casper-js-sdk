import { expect } from 'chai';
import {
  makeAuctionManagerDeploy,
  makeCep18TransferDeploy,
  makeCsprTransferDeploy
} from '../../utils';
import {
  Args,
  CLValue,
  Key,
  KeyTypeID,
  PublicKey,
  ContractCallBuilder,
  NativeDelegateBuilder,
  NativeTransferBuilder,
  SessionBuilder
} from '../../types';
import { AuctionManagerEntryPoint, CasperNetworkName } from '../../@types';

const PK_HEX =
  '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64';
const PK = PublicKey.fromHex(PK_HEX);
const PK_ACCOUNT_KEY = Key.createByType(
  PK.accountHash().toPrefixedString(),
  KeyTypeID.Account
);
const CEP18_PKG =
  'f5e3729b502597fdd7be9ecedb6f73e4530f5e8a4c809f269d757677cbe49b78';

const expectBytesEqual = (a: Uint8Array, b: Uint8Array) =>
  expect(Array.from(a)).to.deep.equal(Array.from(b));

describe('TransactionBuilder', () => {
  describe('NativeTransferBuilder', () => {
    it('creates native CSPR transfer deploy', () => {
      const tx = new NativeTransferBuilder()
        .from(PK)
        .target(PK)
        .amount('25000000000')
        .chainName(CasperNetworkName.Mainnet)
        .payment(100_500_000)
        .buildFor1_5();

      const deploy = makeCsprTransferDeploy({
        chainName: CasperNetworkName.Mainnet,
        recipientPublicKeyHex: PK_HEX,
        senderPublicKeyHex: PK_HEX,
        transferAmount: '25000000000'
      });

      const built = tx.getDeploy();
      expect(built, 'deploy should be built').to.exist;

      const amt = built!.payment.getArgs().getByName('amount')!.ui512!;
      expect(amt.toString()).to.equal('100500000');

      expectBytesEqual(deploy.session.bytes(), built!.session.bytes());
    });
  });

  describe('ContractCallBuilder - CEP18', () => {
    it('creates CEP-18 transfer deploy', () => {
      const tx = new ContractCallBuilder()
        .from(PK)
        .byPackageHash(CEP18_PKG)
        .entryPoint('transfer')
        .runtimeArgs(
          Args.fromMap({
            recipient: CLValue.newCLKey(PK_ACCOUNT_KEY),
            amount: CLValue.newCLUInt256('1000000000')
          })
        )
        .payment(2_000_000_000)
        .chainName(CasperNetworkName.Mainnet)
        .buildFor1_5();

      const deploy = makeCep18TransferDeploy({
        chainName: CasperNetworkName.Mainnet,
        contractPackageHash: CEP18_PKG,
        paymentAmount: '2000000000',
        recipientPublicKeyHex: PK_HEX,
        senderPublicKeyHex: PK_HEX,
        transferAmount: '1000000000'
      });

      const built = tx.getDeploy();
      expect(built).to.exist;
      expectBytesEqual(deploy.session.bytes(), built!.session.bytes());
    });
  });

  describe('NativeDelegateBuilder', () => {
    it('creates auction delegation deploy', () => {
      const tx = new NativeDelegateBuilder()
        .from(PK)
        .validator(PK)
        .amount('100000000000')
        .payment(2_000_000_000)
        .chainName(CasperNetworkName.Mainnet)
        .buildFor1_5();

      const deploy = makeAuctionManagerDeploy({
        amount: '100000000000',
        chainName: CasperNetworkName.Mainnet,
        contractEntryPoint: AuctionManagerEntryPoint.delegate,
        delegatorPublicKeyHex: PK_HEX,
        paymentAmount: '2000000000',
        validatorPublicKeyHex: PK_HEX
      });

      const built = tx.getDeploy();
      expect(built).to.exist;
      expectBytesEqual(deploy.session.bytes(), built!.session.bytes());
    });
  });

  describe('SessionBuilder', () => {
    it('sets gas price to deploy header', () => {
      const tx = new SessionBuilder()
        .from(PK)
        .installOrUpgrade()
        .runtimeArgs(
          Args.fromMap({
            recipient: CLValue.newCLKey(PK_ACCOUNT_KEY),
            amount: CLValue.newCLUInt256('1000000000')
          })
        )
        .wasm(new Uint8Array())
        .payment(2_000_000_000, 2)
        .chainName(CasperNetworkName.Mainnet)
        .buildFor1_5();

      const deploy = tx.getDeploy();
      expect(deploy).to.exist;
      expect(deploy!.header.gasPrice).to.equal(2);
      expect(deploy!.header.chainName).to.equal(CasperNetworkName.Mainnet);
      expect(deploy!.header?.account?.toHex()).to.equal(PK.toHex());
    });
  });
});
