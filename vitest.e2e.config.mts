import { defineConfig } from 'vitest/config';

// The e2e suite talks to a live Casper node and is NOT part of the dev loop —
// see `run_e2e_locally.sh` and `e2e/config.ts` for the env it needs.
//
// `e2e/` holds only `config.ts` and the wasm fixtures today, so
// `passWithNoTests` is deliberate — here and here only. The unit config must
// keep failing on an empty run; skipping that is how the dead karma suite
// stayed invisible for ~18 months.
export default defineConfig({
  test: {
    globals: true,
    include: ['e2e/**/*.test.ts'],
    environment: 'node',
    testTimeout: 5_000_000,
    hookTimeout: 5_000_000,
    passWithNoTests: true
  }
});
