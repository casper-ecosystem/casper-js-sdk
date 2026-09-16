import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Do NOT add `--passWithNoTests`: the karma suite this replaces reported
    // `Executed 0 of 0 SUCCESS` for ~18 months while silently matching no files.
    // Failing on an empty run is the only guard against repeating that.
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // `--browser` flips this on; the settings below only take effect then.
    browser: {
      enabled: false,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }]
    }
  },
  // Browser-mode tests run under Vite, which has no equivalent of webpack's
  // ProvidePlugins, so the `Buffer`/`process` globals the shared code paths use
  // are aliased here. Only those two — nothing in `src` reaches any other Node
  // builtin, and no shim package is installed to alias one to.
  resolve: {
    alias: {
      buffer: 'buffer/',
      process: 'process/browser'
    }
  },
  define: {
    global: 'globalThis'
  },
  // `emitDecoratorMetadata` is on in tsconfig.base.json but must be off for the
  // test transform: tsc guards each `design:paramtypes` entry with a `typeof`
  // check, oxc emits the bare identifier, so a class used as a parameter type
  // before its own declaration (Block.ts: BlockV1/BlockV2) throws a TDZ
  // ReferenceError at import time under ESM. Nothing is lost — reflect-metadata
  // is absent, so the metadata is inert either way.
  oxc: {
    decorator: { legacy: true, emitDecoratorMetadata: false }
  }
});
