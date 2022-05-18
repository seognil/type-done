import { describe, expect, test } from 'vitest';
import { fetchList, fetchSingle } from '../src/process/fetchUtils';
import { checkPkgDeps } from './../src/process/checkPkgDepsByJson';
import { pkgObjCase } from './data-case';

// TODO fix jest runtime config later // Seognil LC 2021/09/17

describe('test fetch single', () => {
  test('deprecated', async () => {
    const result = await fetchSingle('@types/ora');
    expect(result).toMatchObject({ isUseful: false, isDeprecated: true });
  });

  test('latest not deprecated', async () => {
    const result = await fetchSingle('@types/uuid');
    expect(result).toMatchObject({ isUseful: true, isDeprecated: false });
  });

  test('useful', async () => {
    const result = await fetchSingle('lodash');
    expect(result).toMatchObject({ isUseful: true, isDeprecated: false });
  });

  test('not found', async () => {
    const result = await fetchSingle('rocket-jump-sky-high!');
    expect(result).toMatchObject({ isUseful: false, isDeprecated: false });
  });
});

describe('test fetch list', () => {
  const { installedTypes, missedTypes } = checkPkgDeps(pkgObjCase);

  test('check deprecated', async () => {
    const result = await fetchList(installedTypes);
    expect(result.deprecatedTypes.map((e) => e.pkgName)).toEqual([
      '@types/chalk',
      '@types/ora',
      '@types/terser-webpack-plugin',
    ]);
  });

  test('check missing', async () => {
    const result = await fetchList(missedTypes);
    expect(result.usefulTypes.map((e) => e.pkgName)).toEqual([
      '@types/args',
      '@types/babel__core',
      '@types/jest',
      '@types/node',
    ]);
  });
});
