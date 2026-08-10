import { jsonMember, jsonObject } from 'typedjson';

import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';

// Lives outside Transform.ts because TransformRaw.ts needs it and Transform.ts
// imports ~20 symbols back from TransformRaw.ts. With the class declared in
// Transform.ts that cycle threw `Cannot access 'NamedKeyKind' before
// initialization` under native ESM, since typedjson evaluates the
// `() => NamedKeyKind` type thunk eagerly at decoration time.
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
