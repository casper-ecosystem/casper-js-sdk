import { expect } from 'vitest';

import { KeyAlgorithm, PrivateKey, PublicKey } from '../../../types';

describe('PublicKey', () => {
  it('should work PublicKey fromHex and toHex', () => {
    const newKeySecp = PrivateKey.generate(KeyAlgorithm.SECP256K1);
    const hashSecp = newKeySecp.publicKey.toHex();
    const publicKeySecp = PublicKey.fromHex(hashSecp);
    expect(hashSecp).to.deep.equal(publicKeySecp.toHex());

    const newKeyEd = PrivateKey.generate(KeyAlgorithm.ED25519);
    const hashEd = newKeyEd.publicKey.toHex();
    const publicKeyEd = PublicKey.fromHex(hashEd);
    expect(hashEd).to.deep.equal(publicKeyEd.toHex());
  });

  it('should work PublicKey fromHex and toHex with exact hash', () => {
    const hash =
      '0203b9b4cd6085590b68bfccaf7ea1744766e5225928beba99155a1bd79870f7a986';

    const publicKey = PublicKey.fromHex(hash);
    expect(hash).to.deep.equal(publicKey.toHex());
  });

  it('should produce checksummed public key hex', () => {
    const hash =
      '0203E0fb0E4c25be97F2fE87b3067984D28ee7e32b400ce240e52DEd452c49a79567';

    const publicKey = PublicKey.fromHex(hash.toLowerCase(), true);
    expect(hash).to.deep.equal(publicKey.toHex(true));
  });
});
