import { depName2typeName, typeName2depName } from '../src/process/nameMapper';

describe('test package name mapping', () => {
  test('ora', () => {
    expect(depName2typeName('ora')).toBe('@types/ora');
  });
  test('@babel', () => {
    expect(depName2typeName('@babel/core')).toBe('@types/babel__core');
  });

  test('ora reverse', () => {
    expect(typeName2depName('@types/ora')).toBe('ora');
  });
  test('@babel reverse ', () => {
    expect(typeName2depName('@types/babel__core')).toBe('@babel/core');
  });
});
