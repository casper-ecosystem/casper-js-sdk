// import { expect } from 'chai';
// import { CLBool, CLResult, CLErrorCodes } from './index';
// import { Ok, Err } from "ts-results";

// const myOkRes = new CLResult(Ok(new CLBool(true)));
// const myErrRes = new CLResult(Err(CLErrorCodes.EarlyEndOfStream));

// describe('CLResult', () => {
//   it('Should be valid by construction', () => {
//     expect(myOkRes).to.be.an.instanceof(CLResult);
//     expect(myErrRes).to.be.an.instanceof(CLResult);
//   });

//   it('clType() should return proper type', () => {
//     expect(myOkRes.clType().toString()).to.be.eq('Result');
//   });

//   it('remainder() should return proper byte array', () => {
//     const uint8 = Uint8Array.from([1, 1, 1]);
//     const myOkResWithRemainder = new CLResult(Ok(new CLBool(true)), uint8);
//     expect(myOkResWithRemainder.remainder()).to.be.deep.eq(uint8);
//   });

//   it('toBytes() should return proper byte array', () => {
//     expect(myOkRes.toBytes()).to.be.deep.eq(Uint8Array.from([1, 1]));
//     expect(myErrRes.toBytes()).to.be.deep.eq(Uint8Array.from([0, 0]));
//   });
// });
