import { parsePkgTypes } from './../src/pkg-json-analyze';
import { fetchList } from '../src/pkg-fetch-info';
import { pkgObjCase } from './data-case';

describe('test fetch', () => {
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
