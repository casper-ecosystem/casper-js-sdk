import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { CLTypeRaw } from './clvalue';

/**
 * Enum representing the type of entry point.
 */
export enum EntryPointType {
  Caller = 'Caller',
  Called = 'Called',
  Factory = 'Factory',
  Contract = 'Contract',
  Session = 'Session'
}

/**
 * Enum representing the payment options for an entry point.
 */
export enum EntryPointPayment {
  /**
   * The caller must cover cost.
   */
  Caller = 'Caller',
  /**
   * Will cover cost to execute self but not cost of any subsequent invoked contracts.
   */
  DirectInvocationOnly = 'DirectInvocationOnly',
  /**
   * Will cover cost to execute self and the cost of any subsequent invoked contracts.
   */
  SelfOnward = 'SelfOnward'
}

/**
 * Access control options for a contract entry point (method).
 */
@jsonObject
export class EntryPointAccess {
  /**
   * When public, anyone can call this method (no access controls).
   */
  @jsonMember({ name: 'isPublic', constructor: Boolean })
  isPublic: boolean;

  /**
   * Only users from the listed groups may call this method.
   * Note: if the list is empty then this method is not callable from outside the contract.
   */
  @jsonArrayMember(String, { name: 'groups' })
  groups: string[] | null;

  /**
   * Can't be accessed directly but are kept in the derived wasm bytes.
   */
  @jsonMember({ name: 'isTemplate', constructor: Boolean })
  isTemplate: boolean;

  constructor(
    isPublic = false,
    groups: string[] | null = null,
    isTemplate = false
  ) {
    this.isPublic = isPublic;
    this.groups = groups;
    this.isTemplate = isTemplate;
  }

  /**
   * Deserializes an EntryPointAccess instance from its JSON representation.
   * @param json The JSON value to deserialize.
   * @returns A new instance of EntryPointAccess.
   */
  public static fromJSON(json: any): EntryPointAccess | undefined {
    if (json === null || json === undefined) {
      return undefined;
    }

    if (typeof json === 'string') {
      const value = json.toLowerCase();
      if (value === 'public') {
        return new EntryPointAccess(true, null, false);
      }
      if (value === 'template') {
        return new EntryPointAccess(false, null, true);
      }
    } else if (typeof json === 'object') {
      const keys = Object.keys(json);
      if (keys.length > 0 && keys[0].toLowerCase() === 'groups') {
        const groups = json[keys[0]];
        return new EntryPointAccess(false, groups, false);
      }
    }

    throw new Error(
      `Could not deserialize EntryPointAccess. Not expected token found: ${JSON.stringify(
        json
      )}`
    );
  }

  /**
   * Serializes an EntryPointAccess instance into its JSON representation.
   * @param value The EntryPointAccess instance to serialize.
   * @returns The JSON representation of the EntryPointAccess instance.
   */
  public toJSON(): any {
    if (this.isPublic) {
      return 'Public';
    }

    if (this.isTemplate) {
      return 'Template';
    }

    if (this.groups !== null) {
      return { groups: this.groups };
    }

    return 'Public'; // Default to Public if nothing is set
  }
}

/**
 * Class representing an argument for an entry point. Each argument has a name and a corresponding `CLTypeRaw`.
 */
@jsonObject
export class EntryPointArg {
  /**
   * The name of the entry point argument.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The type of the argument, represented by `CLTypeRaw`.
   */
  @jsonMember({
    name: 'cl_type',
    constructor: CLTypeRaw,
    deserializer: json => {
      if (!json) return;
      return CLTypeRaw.parseCLType(json);
    },
    serializer: (value: CLTypeRaw) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  clType: CLTypeRaw;

  /**
   * Constructs an `EntryPointArg` instance.
   * @param name The name of the argument.
   * @param clType The type of the argument.
   */
  constructor(name: string, clType: CLTypeRaw) {
    this.name = name;
    this.clType = clType;
  }
}

/**
 * Class representing version 1 of an entry point in the Casper VM.
 * It contains the entry point's access, arguments, type, payment type, name, and return type.
 */
@jsonObject
export class EntryPointV1 {
  /**
   * The access control for the entry point.
   */
  @jsonMember({
    name: 'access',
    constructor: EntryPointAccess,
    deserializer: json => {
      if (!json) return;
      return EntryPointAccess.fromJSON(json);
    },
    serializer: (value: EntryPointAccess) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  access: EntryPointAccess;

  /**
   * A list of arguments for the entry point.
   */
  @jsonArrayMember(EntryPointArg, { name: 'args' })
  args: EntryPointArg[];

  /**
   * The type of entry point (e.g., session, contract, etc.).
   */
  @jsonMember({
    name: 'entry_point_type',
    constructor: String
  })
  entryPointType: EntryPointType;

  /**
   * The payment method required to access this entry point.
   */
  @jsonMember({
    name: 'entry_point_payment',
    constructor: String
  })
  entryPointPayment: EntryPointPayment;

  /**
   * The name of the entry point.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The return type of the entry point.
   */
  @jsonMember({
    name: 'ret',
    constructor: CLTypeRaw,
    deserializer: json => {
      if (!json) return;
      return CLTypeRaw.parseCLType(json);
    },
    serializer: (value: CLTypeRaw) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  ret: CLTypeRaw;

  /**
   * Constructs an `EntryPointV1` instance.
   *
   * @param access The access control for this entry point.
   * @param args A list of arguments for the entry point.
   * @param entryPointType The type of entry point.
   * @param entryPointPayment The payment method for the entry point.
   * @param name The name of the entry point.
   * @param ret The return type of the entry point.
   */
  constructor(
    access: EntryPointAccess,
    args: EntryPointArg[],
    entryPointType: EntryPointType,
    entryPointPayment: EntryPointPayment,
    name: string,
    ret: CLTypeRaw
  ) {
    this.access = access;
    this.args = args;
    this.entryPointType = entryPointType;
    this.entryPointPayment = entryPointPayment;
    this.name = name;
    this.ret = ret;
  }
}

/**
 * Class representing version 2 of an entry point in the Casper VM.
 * This version includes flags and a function index.
 */
@jsonObject
export class EntryPointV2 {
  /**
   * Flags associated with this entry point.
   */
  @jsonMember({ name: 'flags', constructor: Number })
  flags: number;

  /**
   * The function index for the entry point.
   */
  @jsonMember({ name: 'functionIndex', constructor: Number })
  functionIndex: number;

  /**
   * Constructs an `EntryPointV2` instance.
   *
   * @param flags The flags for the entry point.
   * @param functionIndex The function index for the entry point.
   */
  constructor(flags = 0, functionIndex = 0) {
    this.flags = flags;
    this.functionIndex = functionIndex;
  }
}

/**
 * A wrapper class that can hold either version 1 or version 2 of an entry point.
 */
@jsonObject
export class EntryPointValue {
  /**
   * Version 1 of the entry point, if available.
   */
  @jsonMember({
    name: 'V1CasperVm',
    constructor: EntryPointV1
  })
  v1CasperVm?: EntryPointV1;

  /**
   * Version 2 of the entry point, if available.
   */
  @jsonMember({
    name: 'V2CasperVm',
    constructor: EntryPointV2
  })
  v2CasperVm?: EntryPointV2;

  /**
   * Constructs an `EntryPointValue` instance.
   *
   * @param v1CasperVm Version 1 of the entry point, if available.
   * @param v2CasperVm Version 2 of the entry point, if available.
   */
  constructor(v1CasperVm?: EntryPointV1, v2CasperVm?: EntryPointV2) {
    this.v1CasperVm = v1CasperVm;
    this.v2CasperVm = v2CasperVm;
  }
}
