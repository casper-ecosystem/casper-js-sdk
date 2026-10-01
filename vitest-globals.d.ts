// Makes the globals of `globals: true` (vitest.config.mts) visible to tsc and
// lint without listing `vitest/globals` in `compilerOptions.types` — TS 6
// resolves `types` entries through `typeRoots` only, and vitest is not a
// `@types/*` package.
//
// Included from tsconfig.json, never from tsconfig.build.json: the shipped
// .d.ts must not carry vitest's ambient types.
/// <reference types="vitest/globals" />
