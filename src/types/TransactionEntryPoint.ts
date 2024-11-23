import { jsonObject, jsonMember } from 'typedjson';
import { CLValueString } from './clvalue';
import { CalltableSerialization } from './CalltableSerialization';

/**
 * Enum representing the available transaction entry points, each representing a different operation in the system.
 */
export enum TransactionEntryPointEnum {
  Custom = 'Custom',
  Transfer = 'Transfer',
  AddBid = 'AddBid',
  WithdrawBid = 'WithdrawBid',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  ActivateBid = 'ActivateBid',
  ChangeBidPublicKey = 'ChangeBidPublicKey',
  Call = 'Call',
  AddReservations = 'AddReservations',
  CancelReservations = 'CancelReservations'
}

/**
 * Enum representing the unique tags associated with each transaction entry point.
 * These tags are used to simplify storage and facilitate efficient comparison of entry points.
 */
export enum TransactionEntryPointTag {
  Custom = 0,
  Call = 1,
  Transfer = 2,
  AddBid = 3,
  WithdrawBid = 4,
  Delegate = 5,
  Undelegate = 6,
  Redelegate = 7,
  ActivateBid = 8,
  ChangeBidPublicKey = 9,
  AddReservations = 10,
  CancelReservations = 11
}

/**
 * Represents a transaction entry point, which defines an action to be executed within the system.
 * This class supports predefined entry points as well as custom-defined actions.
 */
@jsonObject
export class TransactionEntryPoint {
  /**
   * The type of transaction entry point, represented as an enum.
   */
  @jsonMember({ constructor: String })
  type: TransactionEntryPointEnum;

  /**
   * Custom entry point identifier, used when the `type` is `Custom`.
   */
  @jsonMember({ constructor: String })
  customEntryPoint?: string;

  /**
   * Initializes a new `TransactionEntryPoint` instance.
   *
   * @param type - The type of transaction entry point.
   * @param customEntryPoint - An optional identifier for custom entry points.
   */
  constructor(type: TransactionEntryPointEnum, customEntryPoint?: string) {
    if (type === TransactionEntryPointEnum.Custom && !customEntryPoint) {
      throw new Error(
        'When specifying Custom entry point, customEntryPoint must be provided'
      );
    }
    this.type = type;
    this.customEntryPoint = customEntryPoint;
  }

  /**
   * Retrieves the unique tag associated with the transaction entry point.
   * Tags are used to identify entry points in a compact and efficient manner.
   *
   * @returns The tag number for the entry point.
   * @throws An error if the entry point is unknown.
   */
  public tag(): number {
    switch (this.type) {
      case TransactionEntryPointEnum.Transfer:
        return TransactionEntryPointTag.Transfer;
      case TransactionEntryPointEnum.AddBid:
        return TransactionEntryPointTag.AddBid;
      case TransactionEntryPointEnum.WithdrawBid:
        return TransactionEntryPointTag.WithdrawBid;
      case TransactionEntryPointEnum.Delegate:
        return TransactionEntryPointTag.Delegate;
      case TransactionEntryPointEnum.Undelegate:
        return TransactionEntryPointTag.Undelegate;
      case TransactionEntryPointEnum.Redelegate:
        return TransactionEntryPointTag.Redelegate;
      case TransactionEntryPointEnum.ActivateBid:
        return TransactionEntryPointTag.ActivateBid;
      case TransactionEntryPointEnum.ChangeBidPublicKey:
        return TransactionEntryPointTag.ChangeBidPublicKey;
      case TransactionEntryPointEnum.Call:
        return TransactionEntryPointTag.Call;
      case TransactionEntryPointEnum.AddReservations:
        return TransactionEntryPointTag.AddReservations;
      case TransactionEntryPointEnum.CancelReservations:
        return TransactionEntryPointTag.CancelReservations;
      case TransactionEntryPointEnum.Custom:
        return TransactionEntryPointTag.Custom;
      default:
        throw new Error('Unknown TransactionEntryPointTag');
    }
  }

  /**
   * Serializes the transaction entry point into a byte array.
   *
   * @returns A `Uint8Array` representing the transaction entry point and any associated data.
   */
  bytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();
    const tag = this.tag();
    calltableSerialization.addField(0, Uint8Array.from([tag]));

    if (
      this.type === TransactionEntryPointEnum.Custom &&
      this.customEntryPoint
    ) {
      const customSerialization = new CalltableSerialization();
      customSerialization.addField(0, Uint8Array.from([1]));
      customSerialization.addField(
        1,
        CLValueString.newCLString(this.customEntryPoint).bytes()
      );

      calltableSerialization.addField(1, customSerialization.toBytes());
    }

    return calltableSerialization.toBytes();
  }

  /**
   * Converts the transaction entry point to a JSON-compatible format.
   *
   * @returns A JSON object representing the transaction entry point.
   */
  toJSON(): unknown {
    if (
      this.type === TransactionEntryPointEnum.Custom &&
      this.customEntryPoint
    ) {
      return { Custom: this.customEntryPoint };
    }

    return this.type;
  }

  /**
   * Creates a `TransactionEntryPoint` instance from a JSON representation.
   *
   * @param json - The JSON representation of the transaction entry point.
   * @returns A `TransactionEntryPoint` instance.
   * @throws An error if the JSON is invalid or the entry point is unknown.
   */
  static fromJSON(json: any): TransactionEntryPoint {
    if (json instanceof Object && json.Custom) {
      return new TransactionEntryPoint(
        TransactionEntryPointEnum.Custom,
        json.Custom
      );
    }

    switch (json) {
      case TransactionEntryPointEnum.Transfer:
        return new TransactionEntryPoint(TransactionEntryPointEnum.Transfer);
      case TransactionEntryPointEnum.AddBid:
        return new TransactionEntryPoint(TransactionEntryPointEnum.AddBid);
      case TransactionEntryPointEnum.WithdrawBid:
        return new TransactionEntryPoint(TransactionEntryPointEnum.WithdrawBid);
      case TransactionEntryPointEnum.Delegate:
        return new TransactionEntryPoint(TransactionEntryPointEnum.Delegate);
      case TransactionEntryPointEnum.Undelegate:
        return new TransactionEntryPoint(TransactionEntryPointEnum.Undelegate);
      case TransactionEntryPointEnum.Redelegate:
        return new TransactionEntryPoint(TransactionEntryPointEnum.Redelegate);
      case TransactionEntryPointEnum.ActivateBid:
        return new TransactionEntryPoint(TransactionEntryPointEnum.ActivateBid);
      case TransactionEntryPointEnum.ChangeBidPublicKey:
        return new TransactionEntryPoint(
          TransactionEntryPointEnum.ChangeBidPublicKey
        );
      case TransactionEntryPointEnum.Call:
        return new TransactionEntryPoint(TransactionEntryPointEnum.Call);
      case TransactionEntryPointEnum.AddReservations:
        return new TransactionEntryPoint(
          TransactionEntryPointEnum.AddReservations
        );
      case TransactionEntryPointEnum.CancelReservations:
        return new TransactionEntryPoint(
          TransactionEntryPointEnum.CancelReservations
        );
      default:
        throw new Error('Unknown entry point');
    }
  }

  /**
   * Deserializes a `TransactionEntryPoint` from its byte representation.
   *
   * This method takes a serialized byte array and reconstructs a `TransactionEntryPoint` object.
   * It supports multiple entry point types, including both predefined and custom entry points.
   *
   * @param bytes - The byte array representing the serialized `TransactionEntryPoint`.
   * @returns A deserialized `TransactionEntryPoint` instance.
   * @throws Will throw an error if the byte array is invalid or has missing fields.
   *
   * ### Example
   * ```typescript
   * const serializedBytes = new Uint8Array([0, 1, 2, 3, ...]);
   * const entryPoint = TransactionEntryPoint.fromBytes(serializedBytes);
   * console.log(entryPoint.type); // Logs the entry point type
   * ```
   */
  static fromBytes(bytes: Uint8Array): TransactionEntryPoint {
    const calltableSerialization = CalltableSerialization.fromBytes(bytes);
    const tagBytes = calltableSerialization.getField(0);

    if (!tagBytes || tagBytes.length !== 1) {
      throw new Error('Invalid tag bytes');
    }

    const tag = tagBytes[0];

    const type = (() => {
      switch (tag) {
        case TransactionEntryPointTag.Transfer:
          return TransactionEntryPointEnum.Transfer;
        case TransactionEntryPointTag.AddBid:
          return TransactionEntryPointEnum.AddBid;
        case TransactionEntryPointTag.WithdrawBid:
          return TransactionEntryPointEnum.WithdrawBid;
        case TransactionEntryPointTag.Delegate:
          return TransactionEntryPointEnum.Delegate;
        case TransactionEntryPointTag.Undelegate:
          return TransactionEntryPointEnum.Undelegate;
        case TransactionEntryPointTag.Redelegate:
          return TransactionEntryPointEnum.Redelegate;
        case TransactionEntryPointTag.ActivateBid:
          return TransactionEntryPointEnum.ActivateBid;
        case TransactionEntryPointTag.ChangeBidPublicKey:
          return TransactionEntryPointEnum.ChangeBidPublicKey;
        case TransactionEntryPointTag.Call:
          return TransactionEntryPointEnum.Call;
        case TransactionEntryPointTag.AddReservations:
          return TransactionEntryPointEnum.AddReservations;
        case TransactionEntryPointTag.CancelReservations:
          return TransactionEntryPointEnum.CancelReservations;
        case TransactionEntryPointTag.Custom:
          return TransactionEntryPointEnum.Custom;
        default:
          throw new Error('Unknown tag');
      }
    })();

    if (type === TransactionEntryPointEnum.Custom) {
      const customBytes = calltableSerialization.getField(1);

      if (!customBytes) {
        throw new Error('Missing custom entry point bytes for Custom type');
      }

      const customSerialization = CalltableSerialization.fromBytes(customBytes);

      const customFlag = customSerialization.getField(0);

      if (!customFlag || customFlag[0] !== 1) {
        throw new Error('Invalid flag for Custom type');
      }

      const customEntryPointBytes = customSerialization.getField(1);

      if (!customEntryPointBytes) {
        throw new Error('Invalid custom entry point bytes');
      }

      const customEntryPoint = CLValueString.fromBytes(
        customEntryPointBytes
      ).result.toString();

      return new TransactionEntryPoint(type, customEntryPoint);
    }

    return new TransactionEntryPoint(type);
  }
}
