// Type definitions for blakejs 1.1.0
// Project: https://github.com/dcposch/blakejs
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare namespace blakejs {
  type Context = {
    b: Uint8Array;
    h: Uint32Array;
    t: number;
    c: number;
    outlen: number;
  };

  type Data = Buffer | Uint8Array | string;

  type Key = Uint8Array | null;

  interface BlakeJs {
    blake2b: (data: Data, key?: Key, outlen?: number) => Uint8Array;
    blake2bFinal: (context: Context) => Uint8Array;
    blake2bHex: (data: Data, key?: Key, outlen?: number) => string;
    blake2bInit: (outlen?: number, key?: Key) => Context;
    blake2bUpdate: (context: Context, data: Data) => void;
    blake2s: (data: Data, key?: Key, outlen?: number) => Uint8Array;
    blake2sFinal: (context: Context) => Uint8Array;
    blake2sHex: (data: Data, key?: Key, outlen?: number) => string;
    blake2sInit: (outlen?: number, key?: Key) => Context;
    blake2sUpdate: (context: Context, data: Data) => void;
  }
}

declare module 'blakejs' {
  const blakejs: blakejs.BlakeJs;

  export default blakejs;
}
