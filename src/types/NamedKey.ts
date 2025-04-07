import { jsonMember, jsonObject } from 'typedjson';
import { Key } from './key';
import { CLValue, CLValueParser } from './clvalue';

/**
 * Represents a named key, consisting of a name and an associated key.
 */
@jsonObject
export class NamedKey {
  /**
   * The name of the named key.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The key associated with the named key.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  key: Key;

  /**
   * Creates a new instance of `NamedKey` with a name and key.
   *
   * @param name The name of the key.
   * @param key The associated key.
   */
  constructor(name: string, key: Key) {
    this.name = name;
    this.key = key;
  }
}

/**
 * Represents a value of a named key, where both the name and key value are `CLValue` types.
 */
@jsonObject
export class NamedKeyValue {
  /**
   * The name of the named key represented as a `CLValue`.
   */
  @jsonMember({
    name: 'name',
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
  name: CLValue;

  /**
   * The value of the named key represented as a `CLValue`.
   */
  @jsonMember({
    name: 'named_key',
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
  namedKey: CLValue;

  /**
   * Creates a new `NamedKeyValue` instance with a name and named key value.
   *
   * @param name The name of the named key as a `CLValue`.
   * @param namedKey The value of the named key as a `CLValue`.
   */
  constructor(name: CLValue, namedKey: CLValue) {
    this.name = name;
    this.namedKey = namedKey;
  }
}
