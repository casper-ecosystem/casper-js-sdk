import { secp256k1 } from '@noble/curves/secp256k1';

// Hand-rolled SEC1 / SPKI DER codec, replacing `asn1.js` (terminal since 2019,
// and only functional here because the repo force-fed it `bn.js@5` through an
// override). The two structures below are the whole of what the SDK ever asked
// asn1.js to do, and both are fixed-shape:
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
// The emitted bytes are pinned by the characterization vectors in
// `src/tests/data/keypair/secp256k1_der_vectors.json`, captured from the
// asn1.js implementation — existing PEM/DER key files must keep parsing and
// newly written ones must stay indistinguishable.

interface PK {
  version: number;
  privateKey: Buffer;
  parameters: number[];
  publicKey?: {
    unused: number;
    data: Buffer;
  };
}

interface SPKI {
  algorithm: {
    id: number[];
    curve: number[];
  };
  pub: {
    unused: number;
    data: Buffer;
  };
}

type KeyFormat = 'raw' | 'pem' | 'der';

const options = {
  curveParameters: [1, 3, 132, 0, 10], // secp256k1 OID
  privatePEMOptions: { label: 'EC PRIVATE KEY' },
  publicPEMOptions: { label: 'PUBLIC KEY' }
};

const algorithmID = [1, 2, 840, 10045, 2, 1]; // id-ecPublicKey

const TAG_INTEGER = 0x02;
const TAG_BIT_STRING = 0x03;
const TAG_OCTET_STRING = 0x04;
const TAG_OBJECT_IDENTIFIER = 0x06;
const TAG_SEQUENCE = 0x30;
/** Context-specific, constructed, tag number 0 — the `[0] EXPLICIT` above. */
const TAG_PARAMETERS = 0xa0;
/** Context-specific, constructed, tag number 1 — the `[1] EXPLICIT` above. */
const TAG_PUBLIC_KEY = 0xa1;

/** DER definite-length encoding: short form below 128, long form above. */
const encodeLength = (length: number): Buffer => {
  if (length < 0x80) return Buffer.from([length]);

  const bytes: number[] = [];
  for (let remaining = length; remaining > 0; remaining >>>= 8) {
    bytes.unshift(remaining & 0xff);
  }

  return Buffer.from([0x80 | bytes.length, ...bytes]);
};

const encodeTLV = (tag: number, value: Buffer): Buffer =>
  Buffer.concat([Buffer.from([tag]), encodeLength(value.length), value]);

/**
 * Encodes a non-negative integer in DER's minimal two's-complement form: no
 * redundant leading `0x00`, but one is prepended when the high bit would
 * otherwise read as a sign bit.
 */
const encodeInteger = (value: number): Buffer => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('DER integer must be a non-negative safe integer');
  }

  const bytes: number[] = [];
  for (let remaining = value; remaining > 0; remaining = Math.floor(remaining / 256)) {
    bytes.unshift(remaining % 256);
  }
  if (bytes.length === 0) bytes.push(0);
  if (bytes[0] & 0x80) bytes.unshift(0);

  return encodeTLV(TAG_INTEGER, Buffer.from(bytes));
};

/**
 * Encodes an OID: the first two arcs are packed into one byte as `40*a + b`,
 * every arc after that as base-128 with the continuation bit set on all but the
 * final byte.
 */
const encodeObjectIdentifier = (arcs: number[]): Buffer => {
  if (arcs.length < 2) {
    throw new Error('DER object identifier needs at least two arcs');
  }

  const bytes: number[] = [arcs[0] * 40 + arcs[1]];
  for (const arc of arcs.slice(2)) {
    const base128: number[] = [arc & 0x7f];
    for (let remaining = arc >>> 7; remaining > 0; remaining >>>= 7) {
      base128.unshift((remaining & 0x7f) | 0x80);
    }
    bytes.push(...base128);
  }

  return encodeTLV(TAG_OBJECT_IDENTIFIER, Buffer.from(bytes));
};

/** BIT STRING, prefixed with its count of unused trailing bits. */
const encodeBitString = (data: Buffer, unused = 0): Buffer =>
  encodeTLV(TAG_BIT_STRING, Buffer.concat([Buffer.from([unused]), data]));

interface Element {
  tag: number;
  value: Buffer;
  /** Offset just past this element, for walking a sequence. */
  end: number;
}

const readElement = (buffer: Buffer, offset: number): Element => {
  if (offset + 2 > buffer.length) {
    throw new Error('Malformed DER: truncated element header');
  }

  const tag = buffer[offset];
  const firstLengthByte = buffer[offset + 1];
  let length: number;
  let valueStart: number;

  if (firstLengthByte < 0x80) {
    length = firstLengthByte;
    valueStart = offset + 2;
  } else {
    const lengthBytes = firstLengthByte & 0x7f;
    if (lengthBytes === 0 || lengthBytes > 4) {
      throw new Error('Malformed DER: unsupported length encoding');
    }
    if (offset + 2 + lengthBytes > buffer.length) {
      throw new Error('Malformed DER: truncated length');
    }
    length = 0;
    for (let i = 0; i < lengthBytes; i++) {
      length = length * 256 + buffer[offset + 2 + i];
    }
    valueStart = offset + 2 + lengthBytes;
  }

  const end = valueStart + length;
  if (end > buffer.length) {
    throw new Error('Malformed DER: element runs past the end of the buffer');
  }

  return { tag, value: buffer.subarray(valueStart, end), end };
};

const expectElement = (
  buffer: Buffer,
  offset: number,
  tag: number,
  what: string
): Element => {
  const element = readElement(buffer, offset);
  if (element.tag !== tag) {
    throw new Error(
      `Malformed DER: expected ${what} (tag 0x${tag.toString(
        16
      )}), got tag 0x${element.tag.toString(16)}`
    );
  }

  return element;
};

const decodeInteger = (value: Buffer): number => {
  if (value.length === 0) throw new Error('Malformed DER: empty integer');
  if (value.length > 4) {
    throw new Error('Malformed DER: integer wider than supported');
  }

  return value.reduce((accumulator, byte) => accumulator * 256 + byte, 0);
};

const decodeObjectIdentifier = (value: Buffer): number[] => {
  if (value.length === 0) {
    throw new Error('Malformed DER: empty object identifier');
  }

  const arcs = [Math.floor(value[0] / 40), value[0] % 40];
  let arc = 0;
  // Indexed rather than `for…of`: `target: es5` cannot iterate a Buffer without
  // `downlevelIteration`, and that flag is not worth turning on for one loop.
  for (let i = 1; i < value.length; i++) {
    const byte = value[i];
    arc = (arc << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) {
      arcs.push(arc);
      arc = 0;
    }
  }

  return arcs;
};

const decodeBitString = (value: Buffer): { unused: number; data: Buffer } => {
  if (value.length === 0) throw new Error('Malformed DER: empty bit string');

  return { unused: value[0], data: Buffer.from(value.subarray(1)) };
};

/** PEM body wrapped at the conventional 64 characters, with no trailing newline. */
const toPem = (der: Buffer, label: string): string => {
  const body = der.toString('base64').replace(/(.{64})/g, '$1\n');

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

const encodeECPrivateKey = (key: PK): Buffer => {
  const parts = [
    encodeInteger(key.version),
    encodeTLV(TAG_OCTET_STRING, key.privateKey)
  ];

  if (key.parameters) {
    parts.push(
      encodeTLV(TAG_PARAMETERS, encodeObjectIdentifier(key.parameters))
    );
  }
  if (key.publicKey) {
    parts.push(
      encodeTLV(
        TAG_PUBLIC_KEY,
        encodeBitString(key.publicKey.data, key.publicKey.unused)
      )
    );
  }

  return encodeTLV(TAG_SEQUENCE, Buffer.concat(parts));
};

const decodeECPrivateKey = (der: Buffer): PK => {
  const sequence = expectElement(der, 0, TAG_SEQUENCE, 'ECPrivateKey SEQUENCE');
  const body = sequence.value;

  const version = expectElement(body, 0, TAG_INTEGER, 'version');
  const privateKey = expectElement(
    body,
    version.end,
    TAG_OCTET_STRING,
    'privateKey'
  );

  const key: PK = {
    version: decodeInteger(version.value),
    privateKey: Buffer.from(privateKey.value),
    parameters: options.curveParameters
  };

  // Both trailing fields are OPTIONAL and identified by their context tag.
  let offset = privateKey.end;
  while (offset < body.length) {
    const element = readElement(body, offset);

    if (element.tag === TAG_PARAMETERS) {
      key.parameters = decodeObjectIdentifier(
        expectElement(element.value, 0, TAG_OBJECT_IDENTIFIER, 'parameters')
          .value
      );
    } else if (element.tag === TAG_PUBLIC_KEY) {
      key.publicKey = decodeBitString(
        expectElement(element.value, 0, TAG_BIT_STRING, 'publicKey').value
      );
    }

    offset = element.end;
  }

  return key;
};

const encodeSubjectPublicKeyInfo = (info: SPKI): Buffer => {
  const algorithm = encodeTLV(
    TAG_SEQUENCE,
    Buffer.concat([
      encodeObjectIdentifier(info.algorithm.id),
      encodeObjectIdentifier(info.algorithm.curve)
    ])
  );

  return encodeTLV(
    TAG_SEQUENCE,
    Buffer.concat([
      algorithm,
      encodeBitString(info.pub.data, info.pub.unused)
    ])
  );
};

const decodeSubjectPublicKeyInfo = (der: Buffer): SPKI => {
  const sequence = expectElement(
    der,
    0,
    TAG_SEQUENCE,
    'SubjectPublicKeyInfo SEQUENCE'
  );
  const body = sequence.value;

  const algorithm = expectElement(body, 0, TAG_SEQUENCE, 'AlgorithmIdentifier');
  const id = expectElement(
    algorithm.value,
    0,
    TAG_OBJECT_IDENTIFIER,
    'algorithm id'
  );
  const curve = expectElement(
    algorithm.value,
    id.end,
    TAG_OBJECT_IDENTIFIER,
    'curve'
  );
  const pub = expectElement(body, algorithm.end, TAG_BIT_STRING, 'pub');

  return {
    algorithm: {
      id: decodeObjectIdentifier(id.value),
      curve: decodeObjectIdentifier(curve.value)
    },
    pub: decodeBitString(pub.value)
  };
};

const assertHexString = (value: unknown, name: string) => {
  if (typeof value !== 'string') throw new Error(`${name} must be a string`);
  if (!/^[0-9a-fA-F]*$/.test(value))
    throw new Error(`${name} must be a hex string`);
};

const getUncompressedPublicKeyHexFromPrivateHex = (privateKeyHex: string) => {
  assertHexString(privateKeyHex, 'privateKey');

  const privBytes = Buffer.from(privateKeyHex, 'hex');
  if (privBytes.length !== 32) {
    throw new Error(
      `Invalid private key length: expected 32 bytes, got ${privBytes.length}`
    );
  }

  // noble returns 65 bytes for uncompressed: 04 || X(32) || Y(32)
  const pubBytes = secp256k1.getPublicKey(privBytes, false);
  return Buffer.from(pubBytes).toString('hex');
};

export function encodePrivate(
  privateKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
): string {
  let privateKeyObject: PK;

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

    privateKeyObject = decodeECPrivateKey(privateKey);
  } else if (originalFormat === 'pem') {
    if (typeof privateKey !== 'string') {
      throw new Error('private key must be a string');
    }

    privateKeyObject = decodeECPrivateKey(
      fromPem(privateKey, options.privatePEMOptions.label)
    );
  } else {
    throw new Error('invalid private key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return privateKeyObject.privateKey.toString('hex');
  } else if (destinationFormat === 'der') {
    return encodeECPrivateKey(privateKeyObject).toString('hex');
  } else if (destinationFormat === 'pem') {
    return toPem(
      encodeECPrivateKey(privateKeyObject),
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
  let publicKeyObject: SPKI;

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

    publicKeyObject = decodeSubjectPublicKeyInfo(publicKey);
  } else if (originalFormat === 'pem') {
    if (typeof publicKey !== 'string') {
      throw new Error('public key must be a string');
    }

    publicKeyObject = decodeSubjectPublicKeyInfo(
      fromPem(publicKey, options.publicPEMOptions.label)
    );
  } else {
    throw new Error('invalid public key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return publicKeyObject.pub.data.toString('hex');
  } else if (destinationFormat === 'der') {
    return encodeSubjectPublicKeyInfo(publicKeyObject).toString('hex');
  } else if (destinationFormat === 'pem') {
    return toPem(
      encodeSubjectPublicKeyInfo(publicKeyObject),
      options.publicPEMOptions.label
    );
  } else {
    throw new Error('invalid destination format for public key');
  }
}

function privateKeyObjectFn(rawPrivateKey: string, rawPublicKey: string): PK {
  const privateKeyObject: PK = {
    version: 1,
    privateKey: Buffer.from(rawPrivateKey, 'hex'),
    parameters: options.curveParameters
  };

  if (rawPublicKey) {
    privateKeyObject.publicKey = {
      unused: 0,
      data: Buffer.from(rawPublicKey, 'hex')
    };
  }

  return privateKeyObject;
}

function publicKeyObjectFn(rawPublicKey: string): SPKI {
  return {
    algorithm: {
      id: algorithmID,
      curve: options.curveParameters
    },
    pub: {
      unused: 0,
      data: Buffer.from(rawPublicKey, 'hex')
    }
  };
}
