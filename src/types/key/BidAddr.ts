import { BigNumber } from '@ethersproject/bignumber';

import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';
import { HexBytes } from '../HexBytes';

/**
 * Enum representing the different types of bid addresses.
 * Each type corresponds to a specific tag value that uniquely identifies the bid address type.
 */
export enum BidAddrTag {
  UnifiedTag = 0,
  ValidatorTag,
  DelegatedAccountTag,
  DelegatedPurseTag,
  CreditTag,
  ReservedDelegationAccountTag,
  ReservedDelegationPurseTag,
  UnbondAccountTag,
  UnbondPurseTag,
  ValidatorRevTag
}

/** Error indicating an invalid BidAddrTag was encountered. */
export const ErrInvalidBidAddrTag = new Error('Invalid BidAddrTag');

/** Error indicating an unexpected BidAddrTag was found in a BidAddr. */
export const ErrUnexpectedBidAddrTagInBidAddr = new Error(
  'Unexpected BidAddrTag in BidAddr'
);

/** Error indicating the BidAddr format is invalid. */
export const ErrInvalidBidAddrFormat = new Error('Invalid BidAddr format');

// Constants defining specific key lengths based on tag type
const UnifiedOrValidatorAddrLen = 33; // BidAddrTag(1) + Hash(32)
const CreditAddrLen = 41; // BidAddrTag(1) + Hash(32) + EraId(8)
const ValidatorHashDelegatorAddrLen = 65; // BidAddrTag(1) + Hash(32) + Hash(32)

/**
 * Represents a bid address, which stores information such as unified, validator, delegator, or credit data types.
 */
@jsonObject
export class BidAddr {
  /** Unified hash for UnifiedTag addresses. */
  @jsonMember({ name: 'Unified', constructor: Hash })
  unified?: Hash;

  /** Validator hash for ValidatorTag addresses. */
  @jsonMember({ name: 'Validator', constructor: Hash })
  validator?: Hash;

  /** Delegator account hash for DelegatedAccountTag addresses. */
  @jsonMember({ name: 'DelegatorAccount', constructor: Hash })
  delegatorAccount?: Hash;

  /** Delegator purse address for DelegatedPurseTag addresses. */
  @jsonMember({ name: 'DelegatorPurseAddress', constructor: String })
  delegatorPurseAddress?: string;

  /** Era ID for CreditTag addresses. */
  @jsonMember({ name: 'EraId', constructor: Number })
  eraId?: number;

  /** Private field indicating the tag type of the BidAddr. */
  private tag: BidAddrTag;

  /**
   * Validates and returns the BidAddrTag from a numeric value.
   * @param tag - The numeric tag value to validate.
   * @returns The corresponding BidAddrTag.
   * @throws {ErrInvalidBidAddrTag} If the tag value is invalid.
   */
  static bidAddrTag(tag: number): BidAddrTag {
    const addrTag = tag as BidAddrTag;

    if (!Object.values(BidAddrTag).includes(addrTag)) {
      throw ErrInvalidBidAddrTag;
    }

    return addrTag;
  }

  /**
   * Returns the tag associated with the bid address.
   * @returns The BidAddrTag of the bid address.
   */
  public getTag(): BidAddrTag {
    return this.tag;
  }

  /**
   * Creates a BidAddr from a hexadecimal string.
   * @param source - The hexadecimal string representation of the BidAddr.
   * @returns A new BidAddr instance.
   * @throws {ErrInvalidBidAddrFormat} If the format is invalid.
   * @throws {ErrUnexpectedBidAddrTagInBidAddr} If an unexpected tag is encountered.
   */
  static fromHex(source: string): BidAddr {
    const hexBytes = Buffer.from(source, 'hex');

    if (hexBytes.length === 0) {
      throw new Error('Wrong key length.');
    }

    const bidAddrTag = BidAddr.bidAddrTag(hexBytes[0]);
    const bidAddr = new BidAddr();
    bidAddr.tag = bidAddrTag;

    switch (bidAddrTag) {
      case BidAddrTag.UnifiedTag:
      case BidAddrTag.ValidatorTag:
      case BidAddrTag.ValidatorRevTag:
        if (hexBytes.length !== UnifiedOrValidatorAddrLen) {
          throw new Error(
            `Wrong key length for ${BidAddrTag[bidAddrTag]} BidAddr. Expected 33 bytes.`
          );
        }
        if (bidAddrTag === BidAddrTag.UnifiedTag) {
          bidAddr.unified = Hash.fromBytes(hexBytes.slice(1, 33))?.result;
        } else {
          bidAddr.validator = Hash.fromBytes(hexBytes.slice(1, 33))?.result;
        }
        break;

      case BidAddrTag.DelegatedAccountTag:
      case BidAddrTag.ReservedDelegationAccountTag:
      case BidAddrTag.UnbondAccountTag:
        if (hexBytes.length !== ValidatorHashDelegatorAddrLen) {
          throw new Error(
            `Wrong key length for ${BidAddrTag[bidAddrTag]} BidAddr. Expected 65 bytes.`
          );
        }
        bidAddr.validator = Hash.fromBytes(hexBytes.slice(1, 33))?.result;
        bidAddr.delegatorAccount = Hash.fromBytes(hexBytes.slice(33))?.result;
        break;

      case BidAddrTag.DelegatedPurseTag:
      case BidAddrTag.ReservedDelegationPurseTag:
      case BidAddrTag.UnbondPurseTag:
        if (hexBytes.length !== ValidatorHashDelegatorAddrLen) {
          throw new Error(
            `Wrong key length for ${BidAddrTag[bidAddrTag]} BidAddr. Expected 65 bytes.`
          );
        }

        bidAddr.validator = Hash.fromBytes(hexBytes.slice(1, 33))?.result;
        bidAddr.delegatorPurseAddress = new HexBytes(
          hexBytes.slice(33)
        ).toHex();
        break;

      case BidAddrTag.CreditTag:
        if (hexBytes.length !== CreditAddrLen) {
          throw new Error(
            'Wrong key length for Credit BidAddr. Expected 41 bytes.'
          );
        }
        bidAddr.validator = Hash.fromBytes(hexBytes.slice(1, 33))?.result;
        bidAddr.eraId = hexBytes.readUInt32LE(33);
        break;

      default:
        throw new Error(`Wrong BidAddr tag ${bidAddrTag}.`);
    }

    return bidAddr;
  }

  /**
   * Creates a BidAddr from a byte array.
   * @param bytes - The byte array.
   * @returns A new BidAddr instance.
   * @throws {ErrInvalidBidAddrFormat} If the format is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<BidAddr> {
    if (bytes.length < UnifiedOrValidatorAddrLen) throw ErrInvalidBidAddrFormat;

    const tag = bytes[0];
    const rem = bytes.subarray(1);
    const bidAddrTag = BidAddr.bidAddrTag(tag);
    const bidAddr = new BidAddr();
    bidAddr.tag = bidAddrTag;

    const parseHashPair = (
      input: Uint8Array
    ): { validator: Hash; delegator: Hash; bytes: Uint8Array } => {
      const { result: validator, bytes: nextBytes } = Hash.fromBytes(input);
      const { result: delegator, bytes } = Hash.fromBytes(nextBytes!);
      return { validator, delegator, bytes };
    };

    const parseHexBytesPair = (
      input: Uint8Array
    ): { validator: Hash; delegator: string; bytes: Uint8Array } => {
      const { result: validator, bytes: nextBytes } = Hash.fromBytes(input);
      const hexBytes = new HexBytes(nextBytes!);
      return { validator, delegator: hexBytes.toHex(), bytes: hexBytes.bytes };
    };

    switch (bidAddrTag) {
      case BidAddrTag.UnifiedTag: {
        const { result: unifiedHash, bytes } = Hash.fromBytes(rem);
        bidAddr.unified = unifiedHash;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.ValidatorTag: {
        const { result: validatorHash, bytes } = Hash.fromBytes(rem);
        bidAddr.validator = validatorHash;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.DelegatedAccountTag: {
        const { validator, delegator, bytes } = parseHashPair(rem);
        bidAddr.delegatorAccount = delegator;
        bidAddr.validator = validator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.CreditTag: {
        const { result: validator, bytes: nextBytes } = Hash.fromBytes(rem);
        const eraIdBytes = Uint8Array.from(nextBytes!.subarray(0, 8));
        bidAddr.eraId = BigNumber.from(eraIdBytes.slice().reverse()).toNumber();
        bidAddr.validator = validator;
        return { result: bidAddr, bytes: nextBytes };
      }
      case BidAddrTag.DelegatedPurseTag: {
        const { validator, delegator, bytes } = parseHexBytesPair(rem);
        bidAddr.validator = validator;
        bidAddr.delegatorPurseAddress = delegator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.ReservedDelegationAccountTag: {
        const { validator, delegator, bytes } = parseHashPair(rem);
        bidAddr.validator = validator;
        bidAddr.delegatorAccount = delegator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.ReservedDelegationPurseTag: {
        const { validator, delegator, bytes } = parseHexBytesPair(rem);
        bidAddr.validator = validator;
        bidAddr.delegatorPurseAddress = delegator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.UnbondAccountTag: {
        const { validator, delegator, bytes } = parseHashPair(rem);
        bidAddr.validator = validator;
        bidAddr.delegatorAccount = delegator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.UnbondPurseTag: {
        const { validator, delegator, bytes } = parseHexBytesPair(rem);
        bidAddr.validator = validator;
        bidAddr.delegatorPurseAddress = delegator;
        return { result: bidAddr, bytes };
      }
      case BidAddrTag.ValidatorRevTag: {
        const { result: validatorRevHash, bytes } = Hash.fromBytes(rem);
        bidAddr.validator = validatorRevHash;
        return { result: bidAddr, bytes };
      }
      default:
        throw ErrInvalidBidAddrFormat;
    }
  }

  /**
   * Returns a prefixed string representation of the BidAddr.
   * @returns The prefixed string representation.
   */
  toPrefixedString(): string {
    return `bid-addr-${this.toHex()}`;
  }

  /**
   * Converts the BidAddr to its hexadecimal string representation, ensuring proper formatting.
   * @returns The hexadecimal string representation of the BidAddr.
   * @throws {Error} If the BidAddr type is unexpected or required fields are missing.
   */
  toHex(): string {
    const tagHex = this.tag.toString(16).padStart(2, '0');

    switch (this.tag) {
      case BidAddrTag.UnifiedTag:
        if (!this.unified) {
          throw new Error(
            `Missing 'unified' field for tag ${BidAddrTag.UnifiedTag}`
          );
        }
        return `${tagHex}${this.unified.toHex()}`;
      case BidAddrTag.ValidatorTag:
        if (!this.validator) {
          throw new Error(
            `Missing 'validator' field for tag ${BidAddrTag.ValidatorTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}`;
      case BidAddrTag.DelegatedAccountTag:
        if (!this.validator || !this.delegatorAccount) {
          throw new Error(
            `Missing 'validator' or 'delegatorAccount' field for tag ${BidAddrTag.DelegatedAccountTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${this.delegatorAccount.toHex()}`;
      case BidAddrTag.DelegatedPurseTag:
        if (!this.validator || !this.delegatorPurseAddress) {
          throw new Error(
            `Missing 'validator' or 'delegatorPurseAddress' field for tag ${BidAddrTag.DelegatedPurseTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${
          this.delegatorPurseAddress
        }`;
      case BidAddrTag.CreditTag:
        if (!this.validator || this.eraId === undefined) {
          throw new Error(
            `Missing 'validator' or 'eraId' field for tag ${BidAddrTag.CreditTag}`
          );
        }
        const eraIdHex = Buffer.alloc(8);
        eraIdHex.writeUInt32LE(this.eraId, 0);
        return `${tagHex}${this.validator.toHex()}${eraIdHex.toString('hex')}`;
      case BidAddrTag.ReservedDelegationAccountTag:
        if (!this.validator || !this.delegatorAccount) {
          throw new Error(
            `Missing 'validator' or 'delegatorAccount' field for tag ${BidAddrTag.ReservedDelegationAccountTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${this.delegatorAccount.toHex()}`;
      case BidAddrTag.ReservedDelegationPurseTag:
        if (!this.validator || !this.delegatorPurseAddress) {
          throw new Error(
            `Missing 'validator' or 'delegatorPurseAddress' field for tag ${BidAddrTag.ReservedDelegationPurseTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${
          this.delegatorPurseAddress
        }`;
      case BidAddrTag.UnbondAccountTag:
        if (!this.validator || !this.delegatorAccount) {
          throw new Error(
            `Missing 'validator' or 'delegatorAccount' field for tag ${BidAddrTag.UnbondAccountTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${this.delegatorAccount.toHex()}`;
      case BidAddrTag.UnbondPurseTag:
        if (!this.validator || !this.delegatorPurseAddress) {
          throw new Error(
            `Missing 'validator' or 'delegatorPurseAddress' field for tag ${BidAddrTag.UnbondPurseTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}${
          this.delegatorPurseAddress
        }`;
      case BidAddrTag.ValidatorRevTag:
        if (!this.validator) {
          throw new Error(
            `Missing 'validator' field for tag ${BidAddrTag.ValidatorRevTag}`
          );
        }
        return `${tagHex}${this.validator.toHex()}`;
      default:
        throw new Error(`Unexpected BidAddr type: ${this.tag}`);
    }
  }

  /**
   * Converts the BidAddr to a byte array.
   * @returns The byte array representation of the BidAddr.
   * @throws {Error} If the BidAddr type is unexpected.
   */
  toBytes(): Uint8Array {
    const typeByte = this.getTag();

    const concatBuffers = (buffers: Buffer[]): Buffer => Buffer.concat(buffers);

    const createBuffer = (tag: number, ...parts: Uint8Array[]): Buffer => {
      return concatBuffers([Buffer.from([tag]), ...parts.map(Buffer.from)]);
    };

    switch (typeByte) {
      case BidAddrTag.UnifiedTag:
        return new Uint8Array(createBuffer(typeByte, this.unified!.toBytes()));
      case BidAddrTag.ValidatorTag:
        return new Uint8Array(
          createBuffer(typeByte, this.validator!.toBytes())
        );
      case BidAddrTag.DelegatedAccountTag:
        if (this.delegatorAccount && this.validator) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              this.delegatorAccount.toBytes()
            )
          );
        }
        break;
      case BidAddrTag.DelegatedPurseTag:
        if (this.delegatorPurseAddress && this.validator) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              HexBytes.fromHex(this.delegatorPurseAddress).bytes
            )
          );
        }
        break;
      case BidAddrTag.CreditTag:
        if (this.validator && this.eraId) {
          const eraIdBuffer = Buffer.alloc(8);
          eraIdBuffer.writeBigUInt64LE(BigInt(this.eraId), 0);
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              new Uint8Array(eraIdBuffer)
            )
          );
        }
        break;
      case BidAddrTag.ReservedDelegationAccountTag:
        if (this.validator && this.delegatorAccount) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              this.delegatorAccount.toBytes()
            )
          );
        }
        break;
      case BidAddrTag.ReservedDelegationPurseTag:
        if (this.delegatorPurseAddress && this.validator) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              HexBytes.fromHex(this.delegatorPurseAddress).bytes
            )
          );
        }
        break;
      case BidAddrTag.UnbondAccountTag:
        if (this.validator && this.delegatorAccount) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              this.delegatorAccount.toBytes()
            )
          );
        }
        break;
      case BidAddrTag.UnbondPurseTag:
        if (this.delegatorPurseAddress && this.validator) {
          return new Uint8Array(
            createBuffer(
              typeByte,
              this.validator.toBytes(),
              HexBytes.fromHex(this.delegatorPurseAddress).bytes
            )
          );
        }
        break;
      case BidAddrTag.ValidatorRevTag:
        if (this.validator) {
          return new Uint8Array(
            createBuffer(typeByte, this.validator.toBytes())
          );
        }
        break;
      default:
        throw new Error(
          `Unexpected BidAddr type: Unknown type byte ${typeByte}`
        );
    }

    throw new Error(
      `Unexpected BidAddr type: Missing required fields for type byte ${typeByte}`
    );
  }

  /**
   * Creates a BidAddr from its JSON representation.
   * @param json - The JSON string.
   * @returns A new BidAddr instance.
   */
  public static fromJSON(json: string): BidAddr {
    return this.fromHex(json);
  }

  /**
   * Converts the BidAddr to its JSON representation.
   * @returns The JSON string representation.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
