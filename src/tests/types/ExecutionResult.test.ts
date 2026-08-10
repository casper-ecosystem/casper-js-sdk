import { expect } from 'vitest';

import { InfoGetDeployResultV1Compatible } from '../../rpc';
import { ExecutionResult } from '../../types';

describe('ExecutionResult', () => {
  it('should parse infoGetDeployResultV1Json to ExecutionResult', async function() {
    const infoGetDeployResultV1Json = {
      deploy: {
        hash:
          'a2a4b37e33a04d5922e435e98ec8d555370a976eb7fa9913155a615fb2536649',
        header: {
          ttl: '30m',
          account:
            '020324b4bb39d5784e90ab616e0a69b0679efa6567efd15277c3cbf63ab2bc56946e',
          body_hash:
            'e9f37dd5a73a58a09694ae77f182fb6e2b5efc53a1605a70766cb94629125206',
          gas_price: 1,
          timestamp: '2024-12-04T10:26:37.952Z',
          chain_name: 'casper-test',
          dependencies: []
        },
        payment: {
          ModuleBytes: {
            args: [
              [
                'amount',
                {
                  bytes: '05005cb2ec22',
                  parsed: '150000000000',
                  cl_type: 'U512'
                }
              ]
            ],
            module_bytes: ''
          }
        },
        session: {
          StoredContractByHash: {
            args: [
              [
                'deployment_threshold',
                {
                  bytes: '01',
                  parsed: 1,
                  cl_type: 'U8'
                }
              ],
              [
                'key_management_threshold',
                {
                  bytes: '01',
                  parsed: 1,
                  cl_type: 'U8'
                }
              ],
              [
                'weights',
                {
                  bytes: '020000000202',
                  parsed: [2, 2],
                  cl_type: {
                    List: 'U8'
                  }
                }
              ],
              [
                'keys',
                {
                  bytes:
                    '02000000007f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba007dc2bcc676eba6196d16374e1a2dbfa1df336f779854d95a0b4e65de6d593158',
                  parsed: [
                    {
                      Account:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    },
                    {
                      Account:
                        'account-hash-7dc2bcc676eba6196d16374e1a2dbfa1df336f779854d95a0b4e65de6d593158'
                    }
                  ],
                  cl_type: {
                    List: 'Key'
                  }
                }
              ]
            ],
            hash:
              '676794cbbb35ff5642d0ae9c35302e244a7236a614d7e9ef58d0fb2cba6be3ed',
            entry_point: 'set_associated_keys'
          }
        },
        approvals: [
          {
            signer:
              '020324b4bb39d5784e90ab616e0a69b0679efa6567efd15277c3cbf63ab2bc56946e',
            signature:
              '027cdf87348450fe1e0418fda7036d6af847324115491cbbd237c947990a6ecd3b77cd667f9b4c0b163b157e72e9ca5a577dcbb3ab2596744e0419da58cb370d2f'
          }
        ]
      },
      api_version: '1.5.8',
      execution_results: [
        {
          result: {
            Success: {
              cost: '981979384',
              effect: {
                operations: [],
                transforms: [
                  {
                    key:
                      'account-hash-6174cf2e6f8fed1715c9a3bace9c50bfe572eecb763b0ed3f644532616452008',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-624dbe2395b9d9503fbee82162f1714ebff6b639f96d2084d26d944c354ec4c5',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c',
                    transform: {
                      WriteCLValue: {
                        bytes: '06a9cbc26e5301',
                        parsed: '1457852173225',
                        cl_type: 'U512'
                      }
                    }
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: {
                      AddUInt512: '150000000000'
                    }
                  },
                  {
                    key:
                      'hash-676794cbbb35ff5642d0ae9c35302e244a7236a614d7e9ef58d0fb2cba6be3ed',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-ff9c3c0c447d2e3a79c02e13d048c03f6fac8a911fdc04118cc754c84ef6259e',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-ebeecefb82070e662a8e9bb128dfbb126567e91c07de5cbd08cb587222542156',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: {
                      WriteAccount:
                        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
                    }
                  },
                  {
                    key:
                      'deploy-a2a4b37e33a04d5922e435e98ec8d555370a976eb7fa9913155a615fb2536649',
                    transform: {
                      WriteDeployInfo: {
                        gas: '981979384',
                        from:
                          'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                        source:
                          'uref-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c-007',
                        transfers: [],
                        deploy_hash:
                          'a2a4b37e33a04d5922e435e98ec8d555370a976eb7fa9913155a615fb2536649'
                      }
                    }
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-624dbe2395b9d9503fbee82162f1714ebff6b639f96d2084d26d944c354ec4c5',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-8cf5e4acf51f54eb59291599187838dc3bc234089c46fc6ca8ad17e762ae4401',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: {
                      WriteCLValue: {
                        bytes: '0467295a93',
                        parsed: '2472159591',
                        cl_type: 'U512'
                      }
                    }
                  },
                  {
                    key:
                      'balance-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c',
                    transform: {
                      AddUInt512: '147527840409'
                    }
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'hash-010c3fe81b7b862e50c77ef9a958a05bfa98444f26f96f23d37a13c96244cfb7',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-90bb02441c92b44b6b97bdb094aa4e30f318a82ba189a3f78166c5742a1b20fe',
                    transform: 'Identity'
                  },
                  {
                    key:
                      'balance-98d945f5324f865243b7c02c0417ab6eac361c5c56602fd42ced834a1ba201b6',
                    transform: {
                      WriteCLValue: {
                        bytes: '00',
                        parsed: '0',
                        cl_type: 'U512'
                      }
                    }
                  },
                  {
                    key:
                      'balance-90bb02441c92b44b6b97bdb094aa4e30f318a82ba189a3f78166c5742a1b20fe',
                    transform: {
                      AddUInt512: '2472159591'
                    }
                  }
                ]
              },
              transfers: []
            }
          },
          block_hash:
            'ab96565a90981ec7c22020bec0be774297b4cc12fa5cb36f45e85c35251711d8'
        }
      ]
    };

    const info = InfoGetDeployResultV1Compatible.fromJSON(
      infoGetDeployResultV1Json
    );
    expect(info).exist;

    const result = ExecutionResult.fromV1(info!.executionResults[0].result);
    expect(result).exist;
  });
});
