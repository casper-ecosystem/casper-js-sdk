import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';

import { Account } from './Account';
import { TransferV1 } from './Transfer';
import { DeployInfo } from './DeployInfo';
import { EraInfo } from './EraInfo';
import { Bid } from './Bid';
import { UnbondingPurse } from './UnbondingPurse';
import { AddressableEntity } from './AddressableEntity';
import { BidKind } from './BidKind';
import { Package } from './Package';
import { MessageChecksum, MessageTopicSummary } from './MessageTopic';
import { NamedKeyValue } from './NamedKey';
import { EntryPointValue } from './EntryPoint';
import { PrepaymentKind } from './Prepayment';
import { Contract } from './Contract';
import { ContractPackage } from './ContractPackage';
import { CLValue, CLValueParser } from './clvalue';
import { SystemByteCode } from './ByteCode';

/**
 * Represents a stored value in a decentralized system. The value can be of different types
 * like `Account`, `Contract`, `Transfer`, etc. Each field corresponds to a specific type of
 * stored data in the system.
 */
@jsonObject
export class StoredValue {
  /**
   * The stored `CLValue`, which is a general-purpose value that can represent various types of data.
   */
  @jsonMember({
    name: 'CLValue',
    constructor: CLValue,
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    }
  })
  clValue?: CLValue;

  /**
   * The stored account information.
   */
  @jsonMember({ name: 'Account', constructor: Account })
  account?: Account;

  /**
   * The stored contract information.
   */
  @jsonMember({ name: 'Contract', constructor: Contract })
  contract?: Contract;

  /**
   * The WebAssembly (WASM) bytecode for the contract, represented as `AnyT`.
   */
  @jsonMember({ name: 'ContractWASM', constructor: AnyT })
  contractWASM?: any;

  /**
   * The stored contract package information.
   */
  @jsonMember({ name: 'ContractPackage', constructor: ContractPackage })
  contractPackage?: ContractPackage;

  /**
   * The legacy transfer information, representing a historical transfer.
   */
  @jsonMember({ name: 'LegacyTransfer', constructor: TransferV1 })
  legacyTransfer?: TransferV1;

  /**
   * The information related to a deploy operation.
   */
  @jsonMember({ name: 'DeployInfo', constructor: DeployInfo })
  deployInfo?: DeployInfo;

  /**
   * The information related to an era.
   */
  @jsonMember({ name: 'EraInfo', constructor: EraInfo })
  eraInfo?: EraInfo;

  /**
   * The stored bid information, typically related to a staking or auction process.
   */
  @jsonMember({ name: 'Bid', constructor: Bid })
  bid?: Bid;

  /**
   * An array of unbonding purses, which represent assets being unbonded.
   */
  @jsonArrayMember(UnbondingPurse, { name: 'Withdraw' })
  withdraw?: UnbondingPurse[];

  /**
   * The stored unbonding purse, representing assets being unbonded.
   */
  @jsonMember({ name: 'Unbonding', constructor: UnbondingPurse })
  unbonding?: UnbondingPurse;

  /**
   * The stored addressable entity information, which is a reference to a contract or other addressable entity.
   */
  @jsonMember({ name: 'AddressableEntity', constructor: AddressableEntity })
  addressableEntity?: AddressableEntity;

  /**
   * The stored bid kind, representing the type or class of a bid.
   */
  @jsonMember({ name: 'BidKind', constructor: BidKind })
  bidKind?: BidKind;

  /**
   * The stored package information, typically a contract or executable package.
   */
  @jsonMember({ name: 'Package', constructor: Package })
  package?: Package;

  /**
   * The stored bytecode, representing compiled contract or executable code.
   */
  @jsonMember({
    name: 'ByteCode',
    constructor: SystemByteCode,
    serializer: (value: SystemByteCode) => {
      if (!value) return;
      return value.toString();
    }
  })
  byteCode?: SystemByteCode;

  /**
   * The stored message topic summary, containing a summary of the message topic.
   */
  @jsonMember({ name: 'MessageTopic', constructor: MessageTopicSummary })
  messageTopic?: MessageTopicSummary;

  /**
   * A checksum of the stored message, typically used for validation purposes.
   */
  @jsonMember({ name: 'Message', constructor: String })
  message?: MessageChecksum;

  /**
   * The stored named key value, representing a key-value pair within a contract or other entity.
   */
  @jsonMember({ name: 'NamedKey', constructor: NamedKeyValue })
  namedKey?: NamedKeyValue;

  /**
   * Stores location, type and data for a gas pre-payment.
   */
  @jsonMember({ name: 'Prepaid', constructor: PrepaymentKind })
  prepaid?: PrepaymentKind;

  /**
   * The stored entry point value, typically representing an entry point in a smart contract.
   */
  @jsonMember({ name: 'EntryPoint', constructor: EntryPointValue })
  entryPoint?: EntryPointValue;
}
