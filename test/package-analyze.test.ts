import { describe, expect, test } from 'vitest';
import { checkPkgDeps } from '../src/process/checkPkgDepsByJson';
import { pkgObjCase } from './data-case';

describe('test pkg parsing', () => {
  test('empty pkg', () => {
    expect(checkPkgDeps({})).toEqual({
      installedTypes: [],
      unusedTypes: [],
      missedTypes: ['@types/node'],
    });
  });

  test('case 1', () => {
    expect(checkPkgDeps(pkgObjCase)).toEqual({
      installedTypes: [
        '@types/chalk',
        '@types/ora',
        '@types/terser-webpack-plugin',
      ],
      unusedTypes: ['@types/terser-webpack-plugin'],
      missedTypes: [
        '@types/args',
        '@types/babel__core',
        '@types/jest',
        '@types/node',
        '@types/rollup__plugin-typescript',
      ],
    });
  });
});
