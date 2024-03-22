import { expect } from 'chai';
import { Secp256K1HDKey } from './Secp256K1HDKey';
import { decodeBase16, encodeBase16 } from '../Conversions';

describe('Secp256K1HDKey', () => {
  // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-secp256k1
  // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-secp256k1
  const secp256k1 = [
    {
      seed: '000102030405060708090a0b0c0d0e0f',
      vectors: [
        {
          chain: 'm',
          private:
            'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35',
          public:
            '0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2'
        },
        {
          chain: "m/0'",
          private:
            'edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea',
          public:
            '035a784662a4a20a65bf6aab9ae98a6c068a81c52e4b032c0fb5400c706cfccc56'
        },
        {
          chain: "m/0'/1",
          private:
            '3c6cb8d0f6a264c91ea8b5030fadaa8e538b020f0a387421a12de9319dc93368',
          public:
            '03501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c'
        },
        {
          chain: "m/0'/1/2'",
          private:
            'cbce0d719ecf7431d88e6a89fa1483e02e35092af60c042b1df2ff59fa424dca',
          public:
            '0357bfe1e341d01c69fe5654309956cbea516822fba8a601743a012a7896ee8dc2'
        },
        {
          chain: "m/0'/1/2'/2",
          private:
            '0f479245fb19a38a1954c5c7c0ebab2f9bdfd96a17563ef28a6a4b1a2a764ef4',
          public:
            '02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29'
        },
        {
          chain: "m/0'/1/2'/2/1000000000",
          private:
            '471b76e389e528d6de6d816857e012c5455051cad6660850e58372a6c3e6e7c8',
          public:
            '022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011'
        }
      ]
    },
    {
      seed: 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542',
      vectors: [
        {
          chain: 'm',
          private:
            '4b03d6fc340455b363f51020ad3ecca4f0850280cf436c70c727923f6db46c3e',
          public:
            '03cbcaa9c98c877a26977d00825c956a238e8dddfbd322cce4f74b0b5bd6ace4a7'
        },
        {
          chain: 'm/0',
          private:
            'abe74a98f6c7eabee0428f53798f0ab8aa1bd37873999041703c742f15ac7e1e',
          public:
            '02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea'
        },
        {
          chain: "m/0/2147483647'",
          private:
            '877c779ad9687164e9c2f4f0f4ff0340814392330693ce95a58fe18fd52e6e93',
          public:
            '03c01e7425647bdefa82b12d9bad5e3e6865bee0502694b94ca58b666abc0a5c3b'
        },
        {
          chain: "m/0/2147483647'/1",
          private:
            '704addf544a06e5ee4bea37098463c23613da32020d604506da8c0518e1da4b7',
          public:
            '03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9'
        },
        {
          chain: "m/0/2147483647'/1/2147483646'",
          private:
            'f1c7c871a54a804afe328b4c83a1c33b8e5ff48f5087273f04efa83b247d6a2d',
          public:
            '02d2b36900396c9282fa14628566582f206a5dd0bcc8d5e892611806cafb0301f0'
        },
        {
          chain: "m/0/2147483647'/1/2147483646'/2",
          private:
            'bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23',
          public:
            '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c'
        }
      ]
    }
  ];
  it('should generate key from mnemonic', () => {
    const mn =
      'equip will roof matter pink blind book anxiety banner elbow sun young';

    const recoveredKey = Secp256K1HDKey.fromMnemonic(mn);

    const key0 = recoveredKey.deriveChild(0);

    expect(key0.accountHex(false)).eq(
      '02028b2ddbe59976ad2f4138ca46553866de5124d13db4e13611ca751eedde9e0297'
    );
  });

  it('should generate r+s signature', () => {
    const hdKey = Secp256K1HDKey.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1HDKey'));

    const signature = hdKey.sign(message);

    expect(signature.length).to.equal(64);
  });

  it('should sign and verify message', () => {
    const hdKey = Secp256K1HDKey.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1HDKey'));

    const signature = hdKey.sign(message);

    expect(hdKey.verify(signature, message)).to.equal(true);
  });

  secp256k1.forEach(({ seed, vectors }) => {
    describe(`Test seed ${seed}`, () => {
      vectors.forEach(({ chain, private: privateKey, public: publicKey }) => {
        it(`should generate correct key pair for ${chain}`, () => {
          const hdKey = new Secp256K1HDKey(decodeBase16(seed));
          const pair = hdKey.derive(chain);

          expect(encodeBase16(pair.privateKey)).eq(privateKey);
          expect(encodeBase16(pair.publicKey.data)).eq(publicKey);
        });
      });
    });
  });
});
