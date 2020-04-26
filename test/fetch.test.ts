import { parsePkgTypes } from './../src/pkg-json-analyze';
import { fetchList, fetchSingle } from '../src/pkg-fetch-info';
import { pkgObjCase } from './data-case';

describe('test fetch single', () => {
  test('deprecated', async () => {
    const result = await fetchSingle('@types/ora');
    expect(result).toMatchObject({ useful: false, deprecated: true });
  });

  test('useful', async () => {
    const result = await fetchSingle('lodash');
    expect(result).toMatchObject({ useful: true, deprecated: false });
  });

  test('not found', async () => {
    const result = await fetchSingle('rocket-jump-sky-high!');
    expect(result).toMatchObject({ useful: false, deprecated: false });
  });
});

jest.setTimeout(30000);

describe('test fetch list', () => {
  const { installed, missed } = parsePkgTypes(pkgObjCase);

  test('check deprecated', async () => {
    const result = await fetchList(installed);
    expect(result.deprecated).toEqual(['@types/chalk', '@types/ora']);
  });

  test('check missing', async () => {
    const result = await fetchList(missed);
    expect(result.useful).toEqual([
      '@types/args',
      '@types/babel__core',
      '@types/jest',
      '@types/node',
    ]);
  });
});
