import { expect } from 'vitest';
import { TypedJSON } from 'typedjson';
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
  PrivateKey,
  KeyAlgorithm,
  ContractCallBuilder,
  NativeDelegateBuilder,
  NativeTransferBuilder,
  SessionBuilder,
  TransactionV1
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

  describe('ProtocolVersionMajor', () => {
    it('ByPackageHashNoVersionTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageHash(
          '0101010101010101010101010101010101010101010101010101010101010101'
        )
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const target = txv1!.payload.fields.target.stored;
      expect(target).to.exist;
      const invocationTarget = target!.id.byPackageHash;
      expect(invocationTarget).to.exist;
      expect(invocationTarget!.addr.toHex()).to.equal(
        '0101010101010101010101010101010101010101010101010101010101010101'
      );
      expect(invocationTarget!.version).to.be.undefined;
      expect(invocationTarget!.protocolVersionMajor).to.be.null;
    });

    it('ByPackageHashWithVersionTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageHash(
          '0101010101010101010101010101010101010101010101010101010101010101',
          undefined,
          2
        )
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const target = txv1!.payload.fields.target.stored;
      expect(target).to.exist;
      const invocationTarget = target!.id.byPackageHash;
      expect(invocationTarget).to.exist;
      expect(invocationTarget!.addr.toHex()).to.equal(
        '0101010101010101010101010101010101010101010101010101010101010101'
      );
      expect(invocationTarget!.version).to.be.undefined;
      expect(invocationTarget!.protocolVersionMajor).to.equal(2);
    });

    it('ByPackageNameNoVersionTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageName('counter_package_name')
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const target = txv1!.payload.fields.target.stored;
      expect(target).to.exist;
      const invocationTarget = target!.id.byPackageName;
      expect(invocationTarget).to.exist;
      expect(invocationTarget!.name).to.equal('counter_package_name');
      expect(invocationTarget!.version).to.be.undefined;
      expect(invocationTarget!.protocolVersionMajor).to.be.null;
    });

    it('ByPackageNameWithVersionTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageName('counter_package_name', 1, 2)
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const target = txv1!.payload.fields.target.stored;
      expect(target).to.exist;
      const invocationTarget = target!.id.byPackageName;
      expect(invocationTarget).to.exist;
      expect(invocationTarget!.name).to.equal('counter_package_name');
      expect(invocationTarget!.version).to.equal(1);
      expect(invocationTarget!.protocolVersionMajor).to.equal(2);
    });

    it('ByPackageNameNoVersionJsonTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageName('counter_package_name')
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const serializer = new TypedJSON(TransactionV1);
      const json = serializer.toPlainJson(txv1!);
      const jsonString = JSON.stringify(json);
      expect(jsonString).to.not.be.null;
      expect(jsonString).to.not.include('protocol_version_major');
    });

    it('ByPackageNameWithVersionJsonTest', async () => {
      const testKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
      const runtimeArgs = Args.fromMap({});

      const transaction = new ContractCallBuilder()
        .from(testKey.publicKey)
        .payment(2_500_000_000, 2)
        .chainName('chain_name')
        .byPackageName('counter_package_name', 1, 2)
        .entryPoint('counter_inc')
        .runtimeArgs(runtimeArgs)
        .build();

      const txv1 = transaction.getTransactionV1();
      expect(txv1).to.exist;
      const serializer = new TypedJSON(TransactionV1);
      const json = serializer.toPlainJson(txv1!);
      const jsonString = JSON.stringify(json);
      expect(jsonString).to.not.be.null;
      expect(jsonString).to.include('"protocol_version_major":2');
    });
  });
});
