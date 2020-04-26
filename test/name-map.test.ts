import { dep2type, type2dep } from '../src/pkg-name-map';

describe('test package name mapping', () => {
  test('ora', () => {
    expect(dep2type('ora')).toBe('@types/ora');
  });
  test('@babel', () => {
    expect(dep2type('@babel/core')).toBe('@types/babel__core');
  });

  test('ora', () => {
    expect(type2dep('@types/ora')).toBe('ora');
  });
  test('@babel reverse ', () => {
    expect(type2dep('@types/babel__core')).toBe('@babel/core');
  });
});
