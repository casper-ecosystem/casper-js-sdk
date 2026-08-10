import { Buffer } from 'buffer';
import process from 'process';

// Browser-mode counterpart to the two `webpack.ProvidePlugin` entries in
// webpack.config.js: the shared source paths reach for the `Buffer` and
// `process` globals, which the web bundle gets from the same shim packages.
// Both already exist under Node, so this is a no-op for the node run.
globalThis.Buffer ??= Buffer;
globalThis.process ??= process;
