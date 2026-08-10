// `globals: true` in vitest.config.mts puts describe/it/expect on globalThis.
// This makes them visible to tsc and to the lint pass without listing
// `vitest/globals` in `compilerOptions.types` — TS 6 resolves `types` entries
// through `typeRoots` only, and vitest is not a `@types/*` package.
//
// Referenced from tsconfig.json's `include`, never from tsconfig.build.json:
// the shipped .d.ts must not carry vitest's ambient types.
/// <reference types="vitest/globals" />
