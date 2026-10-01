import { Buffer } from 'buffer';
import process from 'process';

// Browser-mode counterpart to the two `webpack.ProvidePlugin` entries in
// webpack.config.js: the shared source paths reach for the `Buffer` and
// `process` globals. Both already exist under Node, so this is a no-op there.
globalThis.Buffer ??= Buffer;
globalThis.process ??= process;
