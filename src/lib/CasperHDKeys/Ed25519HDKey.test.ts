import { expect } from 'chai';
import { Ed25519HDKey } from './Ed25519HDKey';
import { decodeBase16, encodeBase16 } from '../Conversions';

describe('Ed25519HDKey', () => {
  // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
  // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-ed25519
  const ed25519 = [
    {
      seed: '000102030405060708090a0b0c0d0e0f',
      vectors: [
        {
          chain: 'm',
          private:
            '2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7',
          public:
            '00a4b2856bfec510abab89753fac1ac0e1112364e7d250545963f135f2a33188ed'
        },
        {
          chain: "m/0'",
          private:
            '68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3',
          public:
            '008c8a13df77a28f3445213a0f432fde644acaa215fc72dcdf300d5efaa85d350c'
        },
        {
          chain: "m/0'/1'",
          private:
            'b1d0bad404bf35da785a64ca1ac54b2617211d2777696fbffaf208f746ae84f2',
          public:
            '001932a5270f335bed617d5b935c80aedb1a35bd9fc1e31acafd5372c30f5c1187'
        },
        {
          chain: "m/0'/1'/2'",
          private:
            '92a5b23c0b8a99e37d07df3fb9966917f5d06e02ddbd909c7e184371463e9fc9',
          public:
            '00ae98736566d30ed0e9d2f4486a64bc95740d89c7db33f52121f8ea8f76ff0fc1'
        },
        {
          chain: "m/0'/1'/2'/2'",
          private:
            '30d1dc7e5fc04c31219ab25a27ae00b50f6fd66622f6e9c913253d6511d1e662',
          public:
            '008abae2d66361c879b900d204ad2cc4984fa2aa344dd7ddc46007329ac76c429c'
        },
        {
          chain: "m/0'/1'/2'/2'/1000000000'",
          private:
            '8f94d394a8e8fd6b1bc2f3f49f5c47e385281d5c17e65324b0f62483e37e8793',
          public:
            '003c24da049451555d51a7014a37337aa4e12d41e485abccfa46b47dfb2af54b7a'
        }
      ]
    },
    {
      seed: 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542',
      vectors: [
        {
          chain: 'm',
          private:
            '171cb88b1b3c1db25add599712e36245d75bc65a1a5c9e18d76f9f2b1eab4012',
          public:
            '008fe9693f8fa62a4305a140b9764c5ee01e455963744fe18204b4fb948249308a'
        },
        {
          chain: "m/0'",
          private:
            '1559eb2bbec5790b0c65d8693e4d0875b1747f4970ae8b650486ed7470845635',
          public:
            '0086fab68dcb57aa196c77c5f264f215a112c22a912c10d123b0d03c3c28ef1037'
        },
        {
          chain: "m/0'/2147483647'",
          private:
            'ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4',
          public:
            '005ba3b9ac6e90e83effcd25ac4e58a1365a9e35a3d3ae5eb07b9e4d90bcf7506d'
        },
        {
          chain: "m/0'/2147483647'/1'",
          private:
            '3757c7577170179c7868353ada796c839135b3d30554bbb74a4b1e4a5a58505c',
          public:
            '002e66aa57069c86cc18249aecf5cb5a9cebbfd6fadeab056254763874a9352b45'
        },
        {
          chain: "m/0'/2147483647'/1'/2147483646'",
          private:
            '5837736c89570de861ebc173b1086da4f505d4adb387c6a1b1342d5e4ac9ec72',
          public:
            '00e33c0f7d81d843c572275f287498e8d408654fdf0d1e065b84e2e6f157aab09b'
        },
        {
          chain: "m/0'/2147483647'/1'/2147483646'/2'",
          private:
            '551d333177df541ad876a60ea71f00447931c0a9da16f227c11ea080d7391b8d',
          public:
            '0047150c75db263559a70d5778bf36abbab30fb061ad69f69ece61a72b0cfa4fc0'
        }
      ]
    }
  ];
  it('should generate key from mnemonic', () => {
    const mn =
      'equip will roof matter pink blind book anxiety banner elbow sun young';

    const hdKey = Ed25519HDKey.fromMnemonic(mn);

    const key0 = hdKey.deriveChild(0);

    expect(key0.accountHex(false)).to.eq(
      '016ca12581a38658e71826aa124ffb9f3e3fdc4687b2379da609b187a5b11a80f1'
    );
  });

  it('should generate r+s signature', () => {
    const hdKey = Ed25519HDKey.new();
    const message = Uint8Array.from(Buffer.from('Hello Ed25519HDKey'));

    const signature = hdKey.sign(message);

    expect(signature.length).to.equal(64);
  });

  it('should sign and verify message', () => {
    const hdKey = Ed25519HDKey.new();
    const message = Uint8Array.from(Buffer.from('Hello Ed25519HDKey'));

    const signature = hdKey.sign(message);

    expect(hdKey.verify(signature, message)).to.equal(true);
  });

  ed25519.forEach(({ seed, vectors }) => {
    describe(`Test seed ${seed}`, () => {
      vectors.forEach(({ chain, private: privateKey, public: publicKey }) => {
        it(`should generate correct key pair for ${chain}`, () => {
          const hdKey = new Ed25519HDKey(decodeBase16(seed));
          const pair = hdKey.derive(chain);

          expect(encodeBase16(pair.privateKey)).eq(privateKey);
          expect('00' + encodeBase16(pair.publicKey.data)).eq(publicKey);
        });
      });
    });
  });
});
