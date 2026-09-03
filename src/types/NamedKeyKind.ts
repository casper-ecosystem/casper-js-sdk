import { jsonMember, jsonObject } from 'typedjson';

import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';

// Must stay out of Transform.ts: TransformRaw.ts needs it and Transform.ts
// imports back from TransformRaw.ts, and typedjson evaluates the
// `() => NamedKeyKind` thunk eagerly while decorating — so under native ESM
// that cycle throws `Cannot access 'NamedKeyKind' before initialization`.
/**
 * Represents a named key transformation in a transaction.
 */
@jsonObject
export class NamedKeyKind {
  /**
   * The named key transformation data represented as `Args`.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  public namedKey: Args;

  /**
   * The name of the key represented as `Args`.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  public name: Args;
}
