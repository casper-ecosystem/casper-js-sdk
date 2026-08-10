import { ECParameters, ECPrivateKey } from '@peculiar/asn1-ecc';
import { AsnConvert, OctetString } from '@peculiar/asn1-schema';
import { AlgorithmIdentifier, SubjectPublicKeyInfo } from '@peculiar/asn1-x509';
import { secp256k1 } from '@noble/curves/secp256k1';

// SEC1 / SPKI codec for secp256k1 keys.
//
//   ECPrivateKey ::= SEQUENCE {                            -- RFC 5915
//     version       INTEGER { ecPrivkeyVer1(1) },
//     privateKey    OCTET STRING,
//     parameters [0] EXPLICIT OBJECT IDENTIFIER OPTIONAL,  -- named curve
//     publicKey  [1] EXPLICIT BIT STRING OPTIONAL
//   }
//
//   SubjectPublicKeyInfo ::= SEQUENCE {                    -- RFC 5480
//     algorithm SEQUENCE { id OBJECT IDENTIFIER, curve OBJECT IDENTIFIER },
//     pub       BIT STRING
//   }
//
// The DER itself is handled by `@peculiar/asn1-*`, which replaced `asn1.js`:
// that package's last release was 5.4.1 in 2020, it was written against
// `bn.js@4` and only worked here because the repo force-fed it `bn.js@5` via an
// override. Parsing key material is the wrong place to carry a hand-written
// parser, so the structural work is delegated and this file keeps only the
// SEC1/SPKI *semantics*.
//
// The emitted bytes are pinned by the characterization vectors in
// `src/tests/data/keypair/secp256k1_der_vectors.json`, captured from the
// asn1.js implementation — existing PEM/DER key files must keep parsing and
// newly written ones must stay indistinguishable.

type KeyFormat = 'raw' | 'pem' | 'der';

const options = {
  privatePEMOptions: { label: 'EC PRIVATE KEY' },
  publicPEMOptions: { label: 'PUBLIC KEY' }
};

/** secp256k1, per SEC 2. */
const SECP256K1_OID = '1.3.132.0.10';
/** id-ecPublicKey, per RFC 5480. */
const ID_EC_PUBLIC_KEY_OID = '1.2.840.10045.2.1';

/** The only version RFC 5915 defines. */
const EC_PRIVATE_KEY_VERSION = 1;
const PRIVATE_KEY_BYTE_LENGTH = 32;
/** Uncompressed points are `04 || X || Y`; compressed are `02|03 || X`. */
const PUBLIC_KEY_BYTE_LENGTHS = [33, 65];

// Copies out of the pooled allocator Buffer.from uses, so the ASN.1 layer never
// sees bytes beyond this key. `Buffer#buffer` is typed `ArrayBufferLike`, but a
// Buffer is never backed by a SharedArrayBuffer here — the cast narrows what
// `slice` returns rather than changing it.
const toArrayBuffer = (bytes: Buffer): ArrayBuffer =>
  bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

const toBuffer = (bytes: ArrayBuffer): Buffer => Buffer.from(bytes);

/** PEM body wrapped at the conventional 64 characters, with no trailing newline. */
const toPem = (der: ArrayBuffer, label: string): string => {
  const body = toBuffer(der)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n');

  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
};

const fromPem = (pem: string, label: string): Buffer => {
  const match = new RegExp(
    `-----BEGIN ${label}-----([\\s\\S]*?)-----END ${label}-----`
  ).exec(pem);

  if (!match) {
    throw new Error(`Malformed PEM: no "${label}" block found`);
  }

  return Buffer.from(match[1].replace(/\s+/g, ''), 'base64');
};

/**
 * Rejects a structurally valid key that is not the one this module handles.
 *
 * Neither this SDK nor the asn1.js implementation before it checked any of
 * this, so a P-256 or P-384 private key — or a truncated one — was silently
 * accepted and then used as if it were secp256k1.
 */
const assertSecp256k1PrivateKey = (key: ECPrivateKey): void => {
  if (key.version !== EC_PRIVATE_KEY_VERSION) {
    throw new Error(
      `Unsupported EC private key version: expected ${EC_PRIVATE_KEY_VERSION}, got ${key.version}`
    );
  }

  const namedCurve = key.parameters?.namedCurve;
  if (namedCurve !== undefined && namedCurve !== SECP256K1_OID) {
    throw new Error(
      `Unsupported curve: expected secp256k1 (${SECP256K1_OID}), got ${namedCurve}`
    );
  }

  const length = key.privateKey.byteLength;
  if (length !== PRIVATE_KEY_BYTE_LENGTH) {
    throw new Error(
      `Invalid private key length: expected ${PRIVATE_KEY_BYTE_LENGTH} bytes, got ${length}`
    );
  }
};

const assertSecp256k1PublicKey = (info: SubjectPublicKeyInfo): void => {
  if (info.algorithm.algorithm !== ID_EC_PUBLIC_KEY_OID) {
    throw new Error(
      `Unsupported public key algorithm: expected id-ecPublicKey (${ID_EC_PUBLIC_KEY_OID}), got ${info.algorithm.algorithm}`
    );
  }

  if (!info.algorithm.parameters) {
    throw new Error('Public key is missing its curve parameters');
  }

  const { namedCurve } = AsnConvert.parse(
    info.algorithm.parameters,
    ECParameters
  );
  if (namedCurve !== SECP256K1_OID) {
    throw new Error(
      `Unsupported curve: expected secp256k1 (${SECP256K1_OID}), got ${namedCurve}`
    );
  }

  assertPublicKeyLength(info.subjectPublicKey.byteLength);
};

const assertPublicKeyLength = (length: number): void => {
  if (!PUBLIC_KEY_BYTE_LENGTHS.includes(length)) {
    throw new Error(
      `Invalid public key length: expected ${PUBLIC_KEY_BYTE_LENGTHS.join(
        ' or '
      )} bytes, got ${length}`
    );
  }
};

const assertHexString = (value: unknown, name: string) => {
  if (typeof value !== 'string') throw new Error(`${name} must be a string`);
  if (!/^[0-9a-fA-F]*$/.test(value))
    throw new Error(`${name} must be a hex string`);
};

const getUncompressedPublicKeyHexFromPrivateHex = (privateKeyHex: string) => {
  assertHexString(privateKeyHex, 'privateKey');

  const privBytes = Buffer.from(privateKeyHex, 'hex');
  if (privBytes.length !== PRIVATE_KEY_BYTE_LENGTH) {
    throw new Error(
      `Invalid private key length: expected ${PRIVATE_KEY_BYTE_LENGTH} bytes, got ${privBytes.length}`
    );
  }

  // noble returns 65 bytes for uncompressed: 04 || X(32) || Y(32)
  const pubBytes = secp256k1.getPublicKey(privBytes, false);
  return Buffer.from(pubBytes).toString('hex');
};

const decodePrivateKey = (der: Buffer): ECPrivateKey => {
  const key = AsnConvert.parse(der, ECPrivateKey);
  assertSecp256k1PrivateKey(key);

  return key;
};

const decodePublicKey = (der: Buffer): SubjectPublicKeyInfo => {
  const info = AsnConvert.parse(der, SubjectPublicKeyInfo);
  assertSecp256k1PublicKey(info);

  return info;
};

export function encodePrivate(
  privateKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
): string {
  let privateKeyObject: ECPrivateKey;

  // Parse incoming private key into a privateKeyObject
  if (originalFormat === 'raw') {
    if (typeof privateKey !== 'string') {
      throw new Error('private key must be a string');
    }

    const rawPublicKey = getUncompressedPublicKeyHexFromPrivateHex(privateKey);
    privateKeyObject = privateKeyObjectFn(privateKey, rawPublicKey);
  } else if (originalFormat === 'der') {
    if (typeof privateKey === 'string') {
      privateKey = Buffer.from(privateKey, 'hex');
    } else if (!Buffer.isBuffer(privateKey)) {
      throw new Error('private key must be a buffer or a string');
    }

    privateKeyObject = decodePrivateKey(privateKey);
  } else if (originalFormat === 'pem') {
    if (typeof privateKey !== 'string') {
      throw new Error('private key must be a string');
    }

    privateKeyObject = decodePrivateKey(
      fromPem(privateKey, options.privatePEMOptions.label)
    );
  } else {
    throw new Error('invalid private key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return toBuffer(privateKeyObject.privateKey.buffer).toString('hex');
  } else if (destinationFormat === 'der') {
    return toBuffer(AsnConvert.serialize(privateKeyObject)).toString('hex');
  } else if (destinationFormat === 'pem') {
    return toPem(
      AsnConvert.serialize(privateKeyObject),
      options.privatePEMOptions.label
    );
  } else {
    throw new Error('invalid destination format for private key');
  }
}

export function encodePublic(
  publicKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
): string {
  let publicKeyObject: SubjectPublicKeyInfo;

  // Parse incoming public key into a publicKeyObject
  if (originalFormat === 'raw') {
    if (typeof publicKey !== 'string') {
      throw new Error('public key must be a string');
    }

    publicKeyObject = publicKeyObjectFn(publicKey);
  } else if (originalFormat === 'der') {
    if (typeof publicKey === 'string') {
      publicKey = Buffer.from(publicKey, 'hex');
    } else if (!Buffer.isBuffer(publicKey)) {
      throw new Error('public key must be a buffer or a string');
    }

    publicKeyObject = decodePublicKey(publicKey);
  } else if (originalFormat === 'pem') {
    if (typeof publicKey !== 'string') {
      throw new Error('public key must be a string');
    }

    publicKeyObject = decodePublicKey(
      fromPem(publicKey, options.publicPEMOptions.label)
    );
  } else {
    throw new Error('invalid public key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return toBuffer(publicKeyObject.subjectPublicKey).toString('hex');
  } else if (destinationFormat === 'der') {
    return toBuffer(AsnConvert.serialize(publicKeyObject)).toString('hex');
  } else if (destinationFormat === 'pem') {
    return toPem(
      AsnConvert.serialize(publicKeyObject),
      options.publicPEMOptions.label
    );
  } else {
    throw new Error('invalid destination format for public key');
  }
}

function privateKeyObjectFn(
  rawPrivateKey: string,
  rawPublicKey: string
): ECPrivateKey {
  const privateKeyObject = new ECPrivateKey({
    version: EC_PRIVATE_KEY_VERSION,
    privateKey: new OctetString(
      toArrayBuffer(Buffer.from(rawPrivateKey, 'hex'))
    ),
    parameters: new ECParameters({ namedCurve: SECP256K1_OID })
  });

  if (rawPublicKey) {
    privateKeyObject.publicKey = toArrayBuffer(
      Buffer.from(rawPublicKey, 'hex')
    );
  }

  return privateKeyObject;
}

function publicKeyObjectFn(rawPublicKey: string): SubjectPublicKeyInfo {
  assertHexString(rawPublicKey, 'publicKey');

  const bytes = Buffer.from(rawPublicKey, 'hex');
  assertPublicKeyLength(bytes.length);

  return new SubjectPublicKeyInfo({
    algorithm: new AlgorithmIdentifier({
      algorithm: ID_EC_PUBLIC_KEY_OID,
      parameters: AsnConvert.serialize(
        new ECParameters({ namedCurve: SECP256K1_OID })
      )
    }),
    subjectPublicKey: toArrayBuffer(bytes)
  });
}
