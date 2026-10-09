# Public and private keys

Provides functionality for working with public and private key cryptography in Casper. This includes generating keys, working with PEM files, and generating and verifying signatures using both the ed25519 and secp256k1 algorithms. However, for ease of use, this implementation is hidden behind the common PublicKey and PrivateKey structs. [(See documentation for more information.)](https://docs.casper.network/developers/dapps/signing-a-transaction#public-key-cryptography)

- [PublicKey](https://github.com/casper-ecosystem/casper-js-sdk/blob/829463f8b0ef4a501e1601e088546a0858857951/src/types/keypair/PublicKey.ts#L54) - Represents a public key with a cryptographic algorithm and key data. Provides utilities for serialization, verification, and obtaining an associated account hash.
- [PrivateKey](https://github.com/casper-ecosystem/casper-js-sdk/blob/829463f8b0ef4a501e1601e088546a0858857951/src/types/keypair/PrivateKey.ts#L38) - Represents a private key with associated public key and cryptographic algorithm. Provides methods for signing messages, exporting to PEM, and generating public keys.

## Usage

```ts
import { KeyAlgorithm, PrivateKey, PublicKey } from 'casper-js-sdk';

const privateKeyAlgoritm = KeyAlgorithm.SECP256K1;

// Generate new
const privateKey = await PrivateKey.generate(privateKeyAlgoritm);

// Recreate from hex string
const privateHex = 'PRIVATE-KEY-HEX...';
const privateKeyFromHex = await PrivateKey.fromHex(
  privateHex,
  privateKeyAlgoritm
);

// Recreate from PEM file
const pemFileString = 'Pem-file-content....';
const privateKeyFromPem = await PrivateKey.fromPem(
  pemFileString,
  privateKeyAlgoritm
);

// Public key from PrivateKey
const publicKey = privateKey.publicKey;

// Public key from hex string
const publicKeyHex =
  '02039daee95ef2cd54a23bd201febc495dc1404bc300c572e77dc55cf8ff53ac4823';
const publicKeyFromHex = PublicKey.fromHex(publicKeyHex);
```
