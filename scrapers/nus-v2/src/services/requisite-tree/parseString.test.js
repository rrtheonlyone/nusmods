// @flow

import parseString, { cleanOperators } from './parseString';
import { mockLogger } from '../../utils/test-utils';

const logger = mockLogger();

describe(cleanOperators, () => {
  const andToken: any = { image: 'and' };
  const orToken: any = { image: 'or' };
  const moduleToken: any = { image: 'CS1000' };

  const leftBracketToken: any = { image: '(' };
  const rightBracketToken: any = { image: ')' };

  it('cleans excess operators from simple strings', () => {
    const tokens = [andToken, moduleToken, orToken, andToken];
    expect(cleanOperators(tokens)).toEqual([moduleToken]);
  });

  it('cleans excess operators within parenthesis', () => {
    const tokens = [leftBracketToken, andToken, moduleToken, orToken, rightBracketToken];
    expect(cleanOperators(tokens)).toEqual([leftBracketToken, moduleToken, rightBracketToken]);
  });

  it('cleans excess operators outside and within parenthesis', () => {
    const tokens = [
      orToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      andToken,
    ];
    expect(cleanOperators(tokens)).toEqual([leftBracketToken, moduleToken, rightBracketToken]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [
      leftBracketToken,
      orToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      andToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([
      leftBracketToken,
      leftBracketToken,
      moduleToken,
      rightBracketToken,
      rightBracketToken,
    ]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [
      leftBracketToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([
      leftBracketToken,
      leftBracketToken,
      moduleToken,
      rightBracketToken,
      rightBracketToken,
    ]);
  });

  it('inserts necessary operators when missing', () => {
    const tokens = [
      leftBracketToken,
      moduleToken,
      orToken,
      moduleToken,
      moduleToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([
      leftBracketToken,
      moduleToken,
      orToken,
      moduleToken,
      orToken,
      moduleToken,
      rightBracketToken,
    ]);
  });

  it('does not throw with empty parenthesis', () => {
    const tokens = [leftBracketToken, rightBracketToken];
    expect(cleanOperators(tokens)).toEqual([]);
  });
});

describe(parseString, () => {
  const parse = (string) => parseString(string, logger);

  it('parses single module to a leaf', () => {
    expect(parse('CS1000')).toEqual('CS1000');
  });

  it('parses simple strings in `or` form', () => {
    expect(parse('CS1000 or CS1001')).toEqual({
      or: ['CS1000', 'CS1001'],
    });
  });

  it('parses simple strings in `and` form', () => {
    expect(parse('CS1000 and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses left to right order for `CS1000 and CS1001 or CS1002`', () => {
    const result = {
      and: [
        'CS1000',
        {
          or: ['CS1001', 'CS1002'],
        },
      ],
    };
    expect(parse('CS1000 and CS1001 or CS1002')).toEqual(result);
  });

  it('parses left to right order for `CS1000 or CS1001 and CS1002`', () => {
    const result = {
      and: [
        {
          or: ['CS1000', 'CS1001'],
        },
        'CS1002',
      ],
    };
    expect(parse('CS1000 or CS1001 and CS1002')).toEqual(result);
  });

  it('parses left to right order for very complex queries multiple(`or` `and`)', () => {
    const result = {
      and: [
        {
          or: ['CS1000', 'CS1001'],
        },
        {
          or: ['CS1002', 'CS1003'],
        },
      ],
    };
    expect(parse('CS1000 or CS1001 and CS1002 or CS1003')).toEqual(result);
  });

  it('parses strings with excess `or` operator', () => {
    expect(parse('or CS1000')).toEqual('CS1000');
    expect(parse('CS1000 or')).toEqual('CS1000');
  });

  it('parses strings with excess `and` operator', () => {
    expect(parse('and CS1000')).toEqual('CS1000');
    expect(parse('CS1000 and')).toEqual('CS1000');
    expect(parse('(CS1000 and)')).toEqual('CS1000');
  });

  it('parses strings with duplicate `and` operator', () => {
    expect(parse('CS1000 and and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with duplicate `or` operator', () => {
    expect(parse('CS1000 or or CS1001')).toEqual({
      or: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with parenthesis that have no modules in between', () => {
    expect(parse('CS1000 ()')).toEqual('CS1000');
  });

  it('parses strings with operators that have no modules in between', () => {
    expect(parse('CS1000 or and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with modules with no operators in between', () => {
    expect(parse('(ES1231 or ESP2107 ST1232) and (MA1102R or MA1505)')).toEqual({
      and: [{ or: ['ES1231', 'ESP2107', 'ST1232'] }, { or: ['MA1102R', 'MA1505'] }],
    });
  });

  it('parses strings with modules with no operators in between', () => {
    expect(parse('(ES1231 and ESP2107 ST1232) or (MA1102R and MA1505)')).toEqual({
      or: [{ and: ['ES1231', 'ESP2107', 'ST1232'] }, { and: ['MA1102R', 'MA1505'] }],
    });
  });
});
