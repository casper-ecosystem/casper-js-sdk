import { TypedJSON } from 'typedjson';
import { StoredValue } from '../../src/lib/StoredValue';
import { expect } from 'chai';

describe('StoredValue', () => {
  it('should parse Account stored value correctly', function () {
    const mockJson = {
      Account: {
        account_hash:
          'account-hash-97623c065702e82ccb15387a1fb8f4f89bd6c54ea3283831249404af8fd2e4bb',
        named_keys: [
          {
            name: 'contract_version',
            key:
              'uref-4d95be7a26ef0ca91f2a1755a7293dfd5a25f1a0f1b69057d7d852c42614ba91-007'
          },
          {
            name: 'faucet',
            key:
              'hash-1c16234ad1d27b51614ec5dca0bc28ea235eb2dc3a1f9d98aa238dc3df1fd63a'
          },
          {
            name: 'faucet_package',
            key:
              'hash-ea058d32053f59e9f66dd3d4de4594a8a3de36c65c87417efe79cdc7c1b926b4'
          },
          {
            name: 'faucet_package_access',
            key:
              'uref-9eab12b986299509b4471060fe4d17f087bdd2596871c38d39019ef94f8d10a6-007'
          }
        ],
        main_purse:
          'uref-657bec09f43593b985fca6a6c1a05c90c35cd85643f96722c9ca652e5d690b94-007',
        associated_keys: [
          {
            account_hash:
              'account-hash-97623c065702e82ccb15387a1fb8f4f89bd6c54ea3283831249404af8fd2e4bb',
            weight: 1
          }
        ],
        action_thresholds: {
          deployment: 1,
          key_management: 1
        }
      }
    };

    const serializer = new TypedJSON(StoredValue);
    const storedValue = serializer.parse(mockJson);
    expect(storedValue?.Account).not.eq(undefined);
    expect(storedValue?.Account?.accountHash()).to.eq(
      mockJson.Account.account_hash
    );
    expect(storedValue?.Account?.actionThresholds).not.eq(undefined);
    expect(storedValue?.Account?.namedKeys[0].name).to.eq('contract_version');
  });

  it('should parse Transfer stored value correctly', function () {
    const mockJson = {
      Transfer: {
        deploy_hash:
          'c5bed7511b23946a87c7237fceb55fe2f3a84ee28a41f3830f021711a1210047',
        from:
          'account-hash-97623c065702e82ccb15387a1fb8f4f89bd6c54ea3283831249404af8fd2e4bb',
        to:
          'account-hash-9244197a59bf76965c4981b04e5e58824d0ba450c68cc50246e83f1b6544638a',
        source:
          'uref-657bec09f43593b985fca6a6c1a05c90c35cd85643f96722c9ca652e5d690b94-007',
        target:
          'uref-5948995a53e298255f3ffc8e13843a5d11f2f5db42c701b38cb7a287b8055aba-004',
        amount: '1000000000',
        gas: '0',
        id: null
      }
    };

    const serializer = new TypedJSON(StoredValue);
    const storedValue = serializer.parse(mockJson);
    expect(storedValue?.Transfer).to.not.eq(undefined);
    expect(storedValue?.Transfer?.deployHash).to.eq(
      mockJson.Transfer.deploy_hash
    );
  });

  it('should parse Contract stored value correctly', function () {
    const mockJson = {
      Contract: {
        contract_package_hash: 'package-uref',
        contract_wasm_hash: 'wasm-hash-uref',
        protocol_version: '1.0.0'
      }
    };

    const serializer = new TypedJSON(StoredValue);
    const storedValue = serializer.parse(mockJson);
    expect(storedValue?.Contract).to.not.eq(undefined);
    expect(storedValue?.Contract?.contractPackageHash).to.eq(
      mockJson.Contract.contract_package_hash
    );
    expect(storedValue?.Contract?.contractWasmHash).to.eq(
      mockJson.Contract.contract_wasm_hash
    );
    expect(storedValue?.Contract?.protocolVersion).to.eq(
      mockJson.Contract.protocol_version
    );
  });

  it('should parse ContractPackage stored value correctly', function () {
    const mockJson = {
      ContractPackage:
        '9eab12b986299509b4471060fe4d17f087bdd2596871c38d39019ef94f8d10a6070100000001000000010000001c16234ad1d27b51614ec5dca0bc28ea235eb2dc3a1f9d98aa238dc3df1fd63a0000000000000000'
    };

    const serializer = new TypedJSON(StoredValue);
    const storedValue = serializer.parse(mockJson);
    expect(storedValue?.ContractPackage).to.not.eq(undefined);
    expect(storedValue?.ContractPackage).to.eq(mockJson.ContractPackage);
  });

  it('should parse DeployInfo stored value correctly', function () {
    const mockJson = {
      DeployInfo: {
        deploy_hash:
          'c5bed7511b23946a87c7237fceb55fe2f3a84ee28a41f3830f021711a1210047',
        transfers: [
          'transfer-c6c3694f3760c562ca41bcfb394f10783e529d336f17a11900b57234830b3e13'
        ],
        from:
          'account-hash-97623c065702e82ccb15387a1fb8f4f89bd6c54ea3283831249404af8fd2e4bb',
        source:
          'uref-657bec09f43593b985fca6a6c1a05c90c35cd85643f96722c9ca652e5d690b94-007',
        gas: '0'
      }
    };

    const serializer = new TypedJSON(StoredValue);
    const storedValue = serializer.parse(mockJson);
    expect(storedValue?.DeployInfo).to.not.eq(undefined);
    expect(storedValue?.DeployInfo?.deployHash).to.eq(
      mockJson.DeployInfo.deploy_hash
    );
    expect(storedValue?.DeployInfo?.from).to.eq(mockJson.DeployInfo.from);
  });
});
