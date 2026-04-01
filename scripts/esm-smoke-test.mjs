import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distEsmPath = path.join(repoRoot, 'dist', 'lib.esm.mjs');

if (!existsSync(distEsmPath)) {
  throw new Error(
    'Missing dist/lib.esm.mjs. Run "npm run build" before the ESM smoke test.'
  );
}

const builtModule = await import(pathToFileURL(distEsmPath).href);
const packageModule = await import('casper-js-sdk');

assert.ok(
  Object.keys(builtModule).length > 0,
  'Built ESM artifact exported no symbols.'
);
assert.ok(
  Object.keys(packageModule).length > 0,
  'Package export path exported no symbols.'
);
assert.equal(
  packageModule.HttpHandler,
  builtModule.HttpHandler,
  'Package import does not resolve to the ESM build.'
);

const handler = new packageModule.HttpHandler(
  'http://localhost:7777/rpc',
  'fetch'
);

assert.equal(
  typeof handler.processCall,
  'function',
  'HttpHandler smoke check failed.'
);

console.log('ESM smoke test passed.');
