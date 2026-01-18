import BN from 'bn.js';
// @ts-ignore
import asn1 from 'asn1.js';
import { secp256k1 } from '@noble/curves/secp256k1';

interface PK {
  version: any;
  privateKey: Buffer;
  parameters: number[];
  publicKey?: {
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

const ECPrivateKeyASN = asn1.define('ECPrivateKey', function () {
  // @ts-ignore
  const self = this as any;
  self.seq().obj(
    self.key('version').int(),
    self.key('privateKey').octstr(),
    self.key('parameters').explicit(0).objid().optional(),
    self.key('publicKey').explicit(1).bitstr().optional()
  );
});

const SubjectPublicKeyInfoASN = asn1.define('SubjectPublicKeyInfo', function () {
  // @ts-ignore
  const self = this as any;
  self.seq().obj(
    self
      .key('algorithm')
      .seq()
      .obj(self.key('id').objid(), self.key('curve').objid()),
    self.key('pub').bitstr()
  );
});

const assertHexString = (value: unknown, name: string) => {
  if (typeof value !== 'string') throw new Error(`${name} must be a string`);
  if (!/^[0-9a-fA-F]*$/.test(value)) throw new Error(`${name} must be a hex string`);
};

const getUncompressedPublicKeyHexFromPrivateHex = (privateKeyHex: string) => {
  assertHexString(privateKeyHex, 'privateKey');

  const privBytes = Buffer.from(privateKeyHex, 'hex');
  if (privBytes.length !== 32) {
    throw new Error(`Invalid private key length: expected 32 bytes, got ${privBytes.length}`);
  }

  // noble returns 65 bytes for uncompressed: 04 || X(32) || Y(32)
  const pubBytes = secp256k1.getPublicKey(privBytes, false);
  return Buffer.from(pubBytes).toString('hex');
};

export function encodePrivate(
  privateKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
) {
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

    privateKeyObject = ECPrivateKeyASN.decode(privateKey, 'der');
  } else if (originalFormat === 'pem') {
    if (typeof privateKey !== 'string') {
      throw new Error('private key must be a string');
    }

    privateKeyObject = ECPrivateKeyASN.decode(
      privateKey,
      'pem',
      options.privatePEMOptions
    );
  } else {
    throw new Error('invalid private key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return privateKeyObject.privateKey.toString('hex');
  } else if (destinationFormat === 'der') {
    return ECPrivateKeyASN.encode(privateKeyObject, 'der').toString('hex');
  } else if (destinationFormat === 'pem') {
    return ECPrivateKeyASN.encode(
      privateKeyObject,
      'pem',
      options.privatePEMOptions
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
  let publicKeyObject: any;

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

    publicKeyObject = SubjectPublicKeyInfoASN.decode(publicKey, 'der');
  } else if (originalFormat === 'pem') {
    if (typeof publicKey !== 'string') {
      throw new Error('public key must be a string');
    }

    publicKeyObject = SubjectPublicKeyInfoASN.decode(
      publicKey,
      'pem',
      options.publicPEMOptions
    );
  } else {
    throw new Error('invalid public key format');
  }

  // Export to destination format
  if (destinationFormat === 'raw') {
    return publicKeyObject.pub.data.toString('hex');
  } else if (destinationFormat === 'der') {
    return SubjectPublicKeyInfoASN.encode(publicKeyObject, 'der').toString('hex');
  } else if (destinationFormat === 'pem') {
    return SubjectPublicKeyInfoASN.encode(
      publicKeyObject,
      'pem',
      options.publicPEMOptions
    );
  } else {
    throw new Error('invalid destination format for public key');
  }
}

function privateKeyObjectFn(rawPrivateKey: string, rawPublicKey: string) {
  const privateKeyObject: PK = {
    version: new BN(1),
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

function publicKeyObjectFn(rawPublicKey: string) {
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