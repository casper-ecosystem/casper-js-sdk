// Cross-version compatibility golden, produced by running the *published*
// casper-js-sdk@5.1.0 over this repository's own fixture corpus. Regenerate with
// `node scripts/generate-compat-golden.js` (see the header of that file).
//
// Consumed by `src/tests/compat/v5_1_0.test.ts`, which re-runs every recorded
// case against the working tree. A mismatch means a 5.1.0 key file, RPC payload
// or serialized transaction would no longer round-trip.
import v5_1_0Golden from './v5_1_0_golden.json';

export { v5_1_0Golden };
