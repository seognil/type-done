import { parsePkgTypes } from '../src/pkg-json-analyze';
import { pkgObjCase } from './data-case';

describe('test pkg parsing', () => {
  test('empty pkg', () => {
    expect(parsePkgTypes({})).toEqual({
      installed: [],
      unused: [],
      missed: ['@types/node'],
    });
  });

  test('case 1', () => {
    expect(parsePkgTypes(pkgObjCase)).toEqual({
      installed: ['@types/chalk', '@types/ora', '@types/terser-webpack-plugin'],
      unused: ['@types/terser-webpack-plugin'],
      missed: [
        '@types/args',
        '@types/babel__core',
        '@types/jest',
        '@types/node',
        '@types/rollup__plugin-typescript',
      ],
    });
  });
});
