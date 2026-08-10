import { expect } from 'vitest';

import { Conversions } from '../../types';

describe('Conversions', () => {
  it('should convert CSPR to motes correctly', function() {
    const bal1 = Conversions.csprToMotes(1).toString();
    const bal2 = Conversions.csprToMotes('123400047000').toString();
    const bal3 = Conversions.csprToMotes(
      '1000000040234023040234023040234023042040230420402000000.4022'
    ).toString();
    const bal4 = Conversions.csprToMotes('0').toString();
    const bal5 = Conversions.csprToMotes('0.111').toString();
    const bal6 = Conversions.csprToMotes('0.000000001').toString();
    const bal7 = Conversions.csprToMotes('0.000000000001').toString();

    expect(bal1).to.deep.equal('1000000000');
    expect(bal2).to.deep.equal('123400047000000000000');
    expect(bal3).to.deep.equal(
      '1000000040234023040234023040234023042040230420402000000402200000'
    );
    expect(bal4).to.deep.equal('0');
    expect(bal5).to.deep.equal('111000000');
    expect(bal6).to.deep.equal('1');
    expect(bal7).to.deep.equal('0');
    expect(() => Conversions.csprToMotes('-100')).to.throw(
      'Invalid input: cspr must be a string representing a valid positive number.'
    );
    expect(() => Conversions.csprToMotes('100,3')).to.throw(
      'Invalid input: cspr must be a string representing a valid positive number.'
    );
    expect(() => Conversions.csprToMotes('abc')).to.throw(
      'Invalid input: cspr must be a string representing a valid positive number.'
    );
    expect(() => Conversions.csprToMotes('34.34.34')).to.throw(
      'Invalid input: cspr must be a string representing a valid positive number.'
    );
  });

  it('should convert motes to CSPR correctly', function() {
    const bal1 = Conversions.motesToCSPR('1');
    const bal2 = Conversions.motesToCSPR('123400047000');
    const bal3 = Conversions.motesToCSPR(
      '1000000040234023040234023040234023042040230420402000000'
    );
    const bal4 = Conversions.motesToCSPR('0');
    const bal5 = Conversions.motesToCSPR('100000000000');

    expect(bal1).to.deep.equal('0.000000001');
    expect(bal2).to.deep.equal('123.400047');
    expect(bal3).to.deep.equal(
      '1000000040234023040234023040234023042040230420.402'
    );
    expect(bal4).to.deep.equal('0');
    expect(bal5).to.deep.equal('100');
    expect(() => Conversions.motesToCSPR('-100')).to.throw(
      'Motes cannot be negative number'
    );
  });
});
