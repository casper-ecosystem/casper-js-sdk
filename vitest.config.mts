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
  // The SDK's shared code paths use the Node globals `Buffer` and `process`,
  // which the webpack web build supplies through its two ProvidePlugins.
  // Browser-mode tests go through Vite instead, so the same two shims are
  // declared here.
  //
  // Only those two. Aliases for `stream` and `util` used to sit here as well,
  // pointing at `stream-browserify` and `util/` — packages this project does not
  // depend on, so Vite would have failed to resolve them the moment anything
  // actually reached for either builtin. Nothing does: the same audit that
  // deleted webpack's `resolve.fallback` block confirmed no `src` module imports
  // them, directly or transitively.
  resolve: {
    alias: {
      buffer: 'buffer/',
      process: 'process/browser'
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
