// Characterization vectors for the secp256k1 SEC1/SPKI DER codec, captured from
// the asn1.js implementation the hand-rolled one replaced. They pin what
// "byte-identical output" means: existing PEM/DER key files must keep parsing,
// and newly written ones must be indistinguishable from the earlier output.
import secp256k1DerVectors from './secp256k1_der_vectors.json';

export { secp256k1DerVectors };
