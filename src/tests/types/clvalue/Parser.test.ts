import { expect } from 'vitest';

import { CLValueParser, CLValue, CLTypeMap, Conversions, CLValueList, TypeID, CLTypeDynamic, CLTypeString, CLTypeList, CLTypeTuple2, CLType } from '../../../types';

describe('CLValue Parser', () => {
  it('should parse json to StoredValue', async () => {
    const json = {
      cl_type: {
        Map: {
          key: 'String',
          value: {
            List: {
              Tuple2: ['String', 'Any']
            }
          }
        }
      },
      bytes:
        '080000000a0000004665654368616e6765640100000003000000666565081000000046656557616c6c65744368616e676564010000000a0000006665655f77616c6c65740b0d0000004f666665724163636570746564040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b050000006f776e65720b0d0000004f6666657243616e63656c6564030000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b0d000000546f6b656e44656c6973746564020000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a0b000000546f6b656e4c6973746564040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a050000006f776e65720b050000007072696365080c000000546f6b656e4f666665726564050000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b05000000707269636508140000006164646974696f6e616c5f726563697069656e740d0b09000000546f6b656e536f6c64040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a0500000062757965720b140000006164646974696f6e616c5f726563697069656e740d0b',
      parsed: null
    };

    const parsedCLValue = CLValueParser.fromJSON(json);

    expect(parsedCLValue).to.be.instanceOf(CLValue);
    expect(parsedCLValue.getType()).to.be.instanceOf(CLTypeMap);
    expect(
      parsedCLValue.map
        ?.getData()[0]
        .inner1.getType()
        .toString()
    ).to.be.deep.equal('String');
    expect(
      parsedCLValue.map
        ?.getData()[0]
        .inner2.getType()
        .toJSON()
    ).to.deep.equal({ List: { Tuple2: ['String', 'Any'] } });
  });

  it('should parse bytes to CLValue', async () => {
    const bytesHex = '420000003e000000100000006576656e745f42616c6c6f74436173740056befc13a6fd62e18f361700a5e08f966901c34df8041b36ec97d54d605c23de00000000000102e8030e0320000000d2263e86f497f42e405d5d1390aa3c1a8bfc35f3699fdc3be806a5cfe139dac90100000032';

    const clValue = CLValueParser.fromBytesWithType(Conversions.decodeBase16(bytesHex));

    expect(clValue.result).to.be.instanceOf(CLValue);
    expect(clValue.result.list).to.be.instanceOf(CLValueList);
    expect(clValue.result.list!.type.elementsType.getTypeID()).to.be.equal(TypeID.U8);
    expect(clValue.result.list!.elements.length).to.be.equal(62);

    expect(clValue.bytes.length).to.equal(41);
  });

  it('should parse bytes with deep structure to CLValue', async () => {
    const bytesHex = '08000000040000004275726e02000000050000006f776e65720b06000000616d6f756e74070e0000004368616e67655365637572697479020000000500000061646d696e0b0e0000007365635f6368616e67655f6d6170110b03110000004465637265617365416c6c6f77616e636504000000050000006f776e65720b070000007370656e6465720b09000000616c6c6f77616e63650707000000646563725f62790711000000496e637265617365416c6c6f77616e636504000000050000006f776e65720b070000007370656e6465720b09000000616c6c6f77616e63650706000000696e635f627907040000004d696e740200000009000000726563697069656e740b06000000616d6f756e74070c000000536574416c6c6f77616e636503000000050000006f776e65720b070000007370656e6465720b09000000616c6c6f77616e636507080000005472616e73666572030000000600000073656e6465720b09000000726563697069656e740b06000000616d6f756e74070c0000005472616e7366657246726f6d04000000070000007370656e6465720b050000006f776e65720b09000000726563697069656e740b06000000616d6f756e7407';

    const clTypeParsingSchema = new CLTypeMap(
      CLTypeString,
      new CLTypeList(
        new CLTypeTuple2(
          CLTypeString,
          new CLTypeDynamic(TypeID.String, CLTypeString),
        ),
      ),
    );

    const clValue = CLValueParser.fromBytesByType(Conversions.decodeBase16(bytesHex), clTypeParsingSchema);

    expect(clValue.result.type).to.be.instanceOf(CLTypeMap);

    expect((clValue.result.type as CLTypeMap).key.getTypeID()).to.be.equal(TypeID.String);
    expect((clValue.result.type as CLTypeMap).val.getTypeID()).to.be.equal(TypeID.List);

    const map = clValue.result.map!.getMap();

    const result: Record<string, { name: string, type: CLType }[]> = {};
    
    for (const [key, value] of Object.entries(map)) {
      result[key] = value.list!.elements.map(el => ({
        name: el.tuple2!.inner1.stringVal!.toString(),
        type: el.tuple2!.inner2.type,
      }));
    }

    expect(JSON.parse(JSON.stringify(result))).to.be.deep.equal({
      "Burn": [
        {
          "name": "owner",
          "type": "Key"
        },
        {
          "name": "amount",
          "type": "U256"
        }
      ],
      "ChangeSecurity": [
        {
          "name": "admin",
          "type": "Key"
        },
        {
          "name": "sec_change_map",
          "type": {
            "Map": {
              "key": "Key",
              "value": "U8"
            }
          }
        }
      ],
      "DecreaseAllowance": [
        {
          "name": "owner",
          "type": "Key"
        },
        {
          "name": "spender",
          "type": "Key"
        },
        {
          "name": "allowance",
          "type": "U256"
        },
        {
          "name": "decr_by",
          "type": "U256"
        }
      ],
      "IncreaseAllowance": [
        {
          "name": "owner",
          "type": "Key"
        },
        {
          "name": "spender",
          "type": "Key"
        },
        {
          "name": "allowance",
          "type": "U256"
        },
        {
          "name": "inc_by",
          "type": "U256"
        }
      ],
      "Mint": [
        {
          "name": "recipient",
          "type": "Key"
        },
        {
          "name": "amount",
          "type": "U256"
        }
      ],
      "SetAllowance": [
        {
          "name": "owner",
          "type": "Key"
        },
        {
          "name": "spender",
          "type": "Key"
        },
        {
          "name": "allowance",
          "type": "U256"
        }
      ],
      "Transfer": [
        {
          "name": "sender",
          "type": "Key"
        },
        {
          "name": "recipient",
          "type": "Key"
        },
        {
          "name": "amount",
          "type": "U256"
        }
      ],
      "TransferFrom": [
        {
          "name": "spender",
          "type": "Key"
        },
        {
          "name": "owner",
          "type": "Key"
        },
        {
          "name": "recipient",
          "type": "Key"
        },
        {
          "name": "amount",
          "type": "U256"
        }
      ]
    });
  });
});
