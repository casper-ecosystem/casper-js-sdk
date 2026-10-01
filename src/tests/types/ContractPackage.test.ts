import { TypedJSON } from 'typedjson';
import { expect } from 'vitest';

import { ContractPackage } from '../../types';

describe('ContractPackage', () => {
  const createSerializerAndParse = (json: any) => {
    const serializer = new TypedJSON(ContractPackage);
    return serializer.parse(json);
  };

  const commonAssertions = (
    contractPackage: ContractPackage | undefined,
    json: any
  ) => {
    expect(contractPackage?.accessKey.toPrefixedString()).to.deep.equal(
      json.access_key
    );
    expect(contractPackage?.lockStatus).to.deep.equal(json.lock_status);
    expect(contractPackage?.versions).to.not.be.empty;
    expect(contractPackage?.groups).to.not.be.empty;

    json.versions.forEach((version: any, index: number) => {
      expect(
        contractPackage?.versions[index].contractHash.toPrefixedString()
      ).to.deep.equal(version.contract_hash);
      expect(contractPackage?.versions[index].contractVersion).to.deep.equal(
        version.contract_version
      );
      expect(
        contractPackage?.versions[index].protocolVersionMajor
      ).to.deep.equal(version.protocol_version_major);
    });
  };

  it('should parse ContractPackage V1', () => {
    const jsonV1 = {
      access_key:
        'uref-dc06bab1599b6163eab6786ca9a13e2ef28f157bd69a3bc3d8a4018a70450f8b-007',
      versions: [
        {
          protocol_version_major: 1,
          contract_version: 1,
          contract_hash:
            'contract-55cc25981545886d019401a40768adf71084ff4c251734b54280c3f1d600c9d1'
        },
        {
          protocol_version_major: 1,
          contract_version: 2,
          contract_hash:
            'contract-171f1bac4d4b12e66bdd1dfe2575c463b2e2ad8706cfa574b87ff5566b4c644c'
        },
        {
          protocol_version_major: 1,
          contract_version: 3,
          contract_hash:
            'contract-52809f5150e80b49096f25964082de4bcc3bdbb243d38414bbb22091a4ebdf96'
        }
      ],
      disabled_versions: [
        {
          protocol_version_major: 1,
          contract_version: 1
        },
        {
          protocol_version_major: 1,
          contract_version: 2
        }
      ],
      groups: [
        {
          group: 'constructor',
          keys: [
            'uref-1ff80105947906fa593f18198825aab2033047253edf839b16f36ab949158d2b-007'
          ]
        }
      ],
      lock_status: 'Unlocked'
    };

    const contractPackage = createSerializerAndParse(jsonV1);
    commonAssertions(contractPackage, jsonV1);

    expect(contractPackage?.disabledVersions[0][0]).to.deep.equal(
      jsonV1.disabled_versions[0].protocol_version_major
    );
    expect(contractPackage?.disabledVersions[0][1]).to.deep.equal(
      jsonV1.disabled_versions[0].contract_version
    );

    jsonV1.groups.forEach((group, index: number) => {
      expect(contractPackage?.groups[index].groupName).to.deep.equal(
        group.group
      );
      expect(
        contractPackage?.groups[index].groupUsers[0].toPrefixedString()
      ).to.deep.equal(group.keys?.[0]);
    });
  });

  it('should parse ContractPackage V2', () => {
    const jsonV2 = {
      access_key:
        'uref-dc06bab1599b6163eab6786ca9a13e2ef28f157bd69a3bc3d8a4018a70450f8b-007',
      versions: [
        {
          protocol_version_major: 1,
          contract_version: 1,
          contract_hash:
            'contract-55cc25981545886d019401a40768adf71084ff4c251734b54280c3f1d600c9d1'
        },
        {
          protocol_version_major: 1,
          contract_version: 2,
          contract_hash:
            'contract-171f1bac4d4b12e66bdd1dfe2575c463b2e2ad8706cfa574b87ff5566b4c644c'
        },
        {
          protocol_version_major: 1,
          contract_version: 3,
          contract_hash:
            'contract-52809f5150e80b49096f25964082de4bcc3bdbb243d38414bbb22091a4ebdf96'
        }
      ],
      disabled_versions: [
        [1, 1],
        [1, 2]
      ],
      groups: [
        {
          group_name: 'constructor',
          group_users: [
            'uref-1ff80105947906fa593f18198825aab2033047253edf839b16f36ab949158d2b-007'
          ]
        }
      ],
      lock_status: 'Unlocked'
    };

    const contractPackage = createSerializerAndParse(jsonV2);
    commonAssertions(contractPackage, jsonV2);

    expect(contractPackage?.disabledVersions[0][0]).to.deep.equal(
      jsonV2.disabled_versions[0][0]
    );
    expect(contractPackage?.disabledVersions[0][1]).to.deep.equal(
      jsonV2.disabled_versions[0][1]
    );
    jsonV2.groups.forEach((group, index: number) => {
      expect(contractPackage?.groups[index].groupName).to.deep.equal(
        group.group_name
      );
      expect(
        contractPackage?.groups[index].groupUsers[0].toPrefixedString()
      ).to.deep.equal(group.group_users?.[0]);
    });
  });
});
