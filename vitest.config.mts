import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // `--browser` flips this on; the instance/provider settings below only take
    // effect then. Do NOT add `--passWithNoTests`: the karma suite this replaces
    // reported `Executed 0 of 0 SUCCESS` for ~18 months because it silently
    // matched no files, and Vitest failing on an empty run is the guard against
    // repeating that.
    browser: {
      enabled: false,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }]
    }
  },
  // The SDK's shared code paths use Node globals (Buffer, process) that the
  // webpack web build polyfills via `resolve.fallback`. Browser-mode tests go
  // through Vite instead, so the same shims have to be declared here.
  resolve: {
    alias: {
      buffer: 'buffer/',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util/'
    }
  },
  define: {
    global: 'globalThis'
  },
  // `emitDecoratorMetadata` is ON in tsconfig.base.json but INERT at runtime:
  // reflect-metadata was dropped in 5.1.0, every @jsonMember declares its type
  // explicitly, and tslib's `__metadata` is a no-op without `Reflect.metadata`.
  //
  // It cannot stay on for the test transform, though. tsc guards each emitted
  // `design:paramtypes` entry with a `typeof X === "undefined"` check; oxc emits
  // the bare identifier, so a class used as a parameter type before its own
  // declaration is evaluated (Block.ts: BlockV1/BlockV2) throws a TDZ
  // ReferenceError at import time under ESM. Turning the metadata off here drops
  // the dead `__metadata` calls the tests never needed in the first place.
  oxc: {
    decorator: { legacy: true, emitDecoratorMetadata: false }
  }
});
