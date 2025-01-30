import { expect } from 'chai';

import {
  ContractCallBuilder,
  NativeDelegateBuilder,
  NativeTransferBuilder
} from './TransactionBuilder';
import { PublicKey } from './keypair';
import {
  makeAuctionManagerDeploy,
  makeCep18TransferDeploy,
  makeCsprTransferDeploy
} from '../utils';
import { Args } from './Args';
import { CLValue } from './clvalue';
import { Key, KeyTypeID } from './key';
import { AuctionManagerEntryPoint, CasperNetworkName } from '../@types';

describe('Test TransactionBuilder', () => {
  it('should create native CSPR transfer Deploy', () => {
    const tx = new NativeTransferBuilder()
      .from(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .target(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .amount('25000000000')
      .chainName('casper')
      .payment(100_000_000)
      .buildFor1_5();

    const deploy = makeCsprTransferDeploy({
      chainName: 'casper',
      recipientPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64',
      senderPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64',
      transferAmount: '25000000000'
    });

    expect(deploy.session.bytes().toString()).to.be.equal(
      tx
        .getDeploy()
        ?.session.bytes()
        .toString()
    );
  });

  it('should create CEP-18 transfer Deploy', () => {
    const tx = new ContractCallBuilder()
      .from(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .byPackageHash(
        'f5e3729b502597fdd7be9ecedb6f73e4530f5e8a4c809f269d757677cbe49b78'
      )
      .entryPoint('transfer')
      .runtimeArgs(
        Args.fromMap({
          recipient: CLValue.newCLKey(
            Key.createByType(
              PublicKey.fromHex(
                '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
              )
                .accountHash()
                .toPrefixedString(),
              KeyTypeID.Account
            )
          ),
          amount: CLValue.newCLUInt256('1000000000')
        })
      )
      .payment(2_000000000)
      .chainName('casper')
      .buildFor1_5();

    const deploy = makeCep18TransferDeploy({
      chainName: 'casper',
      contractPackageHash:
        'f5e3729b502597fdd7be9ecedb6f73e4530f5e8a4c809f269d757677cbe49b78',
      paymentAmount: '2000000000',
      recipientPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64',
      senderPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64',
      transferAmount: '1000000000'
    });

    expect(deploy.session.bytes().toString()).to.be.equal(
      tx
        .getDeploy()
        ?.session.bytes()
        .toString()
    );
  });

  it('should create Auction Delegation Deploy', () => {
    const tx = new NativeDelegateBuilder()
      .from(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .validator(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .amount('100000000000')
      .payment(2000000000)
      .chainName('casper')
      .buildFor1_5();

    const deploy = makeAuctionManagerDeploy({
      amount: '100000000000',
      chainName: CasperNetworkName.Mainnet,
      contractEntryPoint: AuctionManagerEntryPoint.delegate,
      delegatorPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64',
      paymentAmount: '2000000000',
      validatorPublicKeyHex:
        '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
    });

    expect(deploy.session.bytes().toString()).to.be.equal(
      tx
        .getDeploy()
        ?.session.bytes()
        .toString()
    );
  });
});
