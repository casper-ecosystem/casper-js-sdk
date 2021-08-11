import { expect } from 'chai';
import { Ed25519, Secp256K1 } from '../../src/lib/Keys';
import { signMessage, verifyMessageSignature } from '../../src/lib/SignedMessage';

describe('SignedMessage', () => {
  it('Should generate proper signed message and validate it (Ed25519)', () => {
    const signKeyPair = Ed25519.new();
    const exampleMessage = "Hello World!";
    const wrongMessage = "!Hello World";

    const signature = signMessage(signKeyPair, exampleMessage);
    const valid = verifyMessageSignature(signKeyPair.publicKey, exampleMessage, signature);
    const invalid = verifyMessageSignature(signKeyPair.publicKey, wrongMessage, signature);

    expect(valid).to.be.eq(true);
    expect(invalid).to.be.eq(false);
  });

  it('Should generate proper signed message and validate it (Secp256K1)', () => {
    const signKeyPair = Secp256K1.new();
    const exampleMessage = "Hello World!";
    const wrongMessage = "!Hello World";

    const signature = signMessage(signKeyPair, exampleMessage);
    const valid = verifyMessageSignature(signKeyPair.publicKey, exampleMessage, signature);
    const invalid = verifyMessageSignature(signKeyPair.publicKey, wrongMessage, signature);

    expect(valid).to.be.eq(true);
    expect(invalid).to.be.eq(false);
  });
});
