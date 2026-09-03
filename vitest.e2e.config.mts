import { defineConfig } from 'vitest/config';

// The e2e suite talks to a live Casper node and is NOT part of the dev loop —
// see `e2e/run.sh` and `e2e/config.ts` for the env it needs.
//
// Do NOT add `passWithNoTests`: an empty run has to fail here exactly as it
// does in the unit config, which is how the dead karma suite stayed invisible
// for ~18 months.
//
// `fileParallelism: false`: every suite shares one faucet account, and
// concurrent files racing its nonce/balance is exactly the flake this avoids.
export default defineConfig({
  test: {
    globals: true,
    include: ['e2e/**/*.test.ts'],
    environment: 'node',
    testTimeout: 5_000_000,
    hookTimeout: 5_000_000,
    fileParallelism: false
  },
  // Same TDZ trap `vitest.config.mts` works around — see CLAUDE.md's
  // `emitDecoratorMetadata` note.
  oxc: {
    decorator: { legacy: true, emitDecoratorMetadata: false }
  }
});
