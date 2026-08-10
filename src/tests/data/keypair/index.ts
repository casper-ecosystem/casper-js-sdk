// Characterization vectors for the secp256k1 SEC1/SPKI DER codec, captured from
// the asn1.js implementation before it was replaced by the hand-rolled one.
// These are what "byte-identical output" means: existing PEM/DER key files must
// keep parsing, and newly written ones must be indistinguishable from what the
// SDK emitted before.
import secp256k1DerVectors from './secp256k1_der_vectors.json';

export { secp256k1DerVectors };
