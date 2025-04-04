import elliptic_1 from 'elliptic';
import BN from 'bn.js';
// @ts-ignore
import asn1 from 'asn1.js';

// Based on https://github.com/stacks-archive/key-encoder-js

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
  curveParameters: [1, 3, 132, 0, 10],
  privatePEMOptions: { label: 'EC PRIVATE KEY' },
  publicPEMOptions: { label: 'PUBLIC KEY' },
  curve: new elliptic_1.ec('secp256k1')
};

const algorithmID = [1, 2, 840, 10045, 2, 1];

const ECPrivateKeyASN = asn1.define('ECPrivateKey', function() {
  // @ts-ignore
  const self = this as any;
  self.seq().obj(
    self.key('version').int(),
    self.key('privateKey').octstr(),
    self
      .key('parameters')
      .explicit(0)
      .objid()
      .optional(),
    self
      .key('publicKey')
      .explicit(1)
      .bitstr()
      .optional()
  );
});

const SubjectPublicKeyInfoASN = asn1.define('SubjectPublicKeyInfo', function() {
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

export function encodePrivate(
  privateKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
) {
  let privateKeyObject;

  /* Parse the incoming private key and convert it to a private key object */
  if (originalFormat === 'raw') {
    if (typeof privateKey !== 'string') {
      throw 'private key must be a string';
    }

    const keyPair = options.curve.keyFromPrivate(privateKey, 'hex');
    const rawPublicKey = keyPair.getPublic('hex');
    privateKeyObject = privateKeyObjectFn(privateKey, rawPublicKey);
  } else if (originalFormat === 'der') {
    if (typeof privateKey !== 'string') {
      // do nothing
    } else if (typeof privateKey === 'string') {
      privateKey = Buffer.from(privateKey, 'hex');
    } else {
      throw 'private key must be a buffer or a string';
    }
    privateKeyObject = ECPrivateKeyASN.decode(privateKey, 'der');
  } else if (originalFormat === 'pem') {
    if (typeof privateKey !== 'string') {
      throw 'private key must be a string';
    }
    privateKeyObject = ECPrivateKeyASN.decode(
      privateKey,
      'pem',
      options.privatePEMOptions
    );
  } else {
    throw 'invalid private key format';
  }
  /* Export the private key object to the desired format */
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
    throw 'invalid destination format for private key';
  }
}

export function encodePublic(
  publicKey: string | Buffer,
  originalFormat: KeyFormat,
  destinationFormat: KeyFormat
): string {
  let publicKeyObject;

  /* Parse the incoming public key and convert it to a public key object */
  if (originalFormat === 'raw') {
    if (typeof publicKey !== 'string') {
      throw 'public key must be a string';
    }
    publicKeyObject = publicKeyObjectFn(publicKey);
  } else if (originalFormat === 'der') {
    if (typeof publicKey !== 'string') {
      // do nothing
    } else if (typeof publicKey === 'string') {
      publicKey = Buffer.from(publicKey, 'hex');
    } else {
      throw 'public key must be a buffer or a string';
    }
    publicKeyObject = SubjectPublicKeyInfoASN.decode(publicKey, 'der');
  } else if (originalFormat === 'pem') {
    if (typeof publicKey !== 'string') {
      throw 'public key must be a string';
    }
    publicKeyObject = SubjectPublicKeyInfoASN.decode(
      publicKey,
      'pem',
      options.publicPEMOptions
    );
  } else {
    throw 'invalid public key format';
  }

  /* Export the private key object to the desired format */
  if (destinationFormat === 'raw') {
    return publicKeyObject.pub.data.toString('hex');
  } else if (destinationFormat === 'der') {
    return SubjectPublicKeyInfoASN.encode(publicKeyObject, 'der').toString(
      'hex'
    );
  } else if (destinationFormat === 'pem') {
    return SubjectPublicKeyInfoASN.encode(
      publicKeyObject,
      'pem',
      options.publicPEMOptions
    );
  } else {
    throw 'invalid destination format for public key';
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
  }
}
