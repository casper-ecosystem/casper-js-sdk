// Cross-version compatibility golden: the *published* casper-js-sdk@5.1.0 run
// over this repository's own fixture corpus. Regenerate with
// `node scripts/generate-compat-golden.js`.
//
// `src/tests/compat/v5_1_0.test.ts` replays it against the working tree; a
// mismatch means a 5.1.0 key file, RPC payload or serialized transaction would
// no longer round-trip.
import v5_1_0Golden from './v5_1_0_golden.json';

export { v5_1_0Golden };
