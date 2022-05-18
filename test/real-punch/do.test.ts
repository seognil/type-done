import { execSync } from 'child_process';
import fs from 'fs';
import jsonfile from 'jsonfile';
import { resolve } from 'path';
import rimraf from 'rimraf';
import { describe, expect, test } from 'vitest';

// * ----------------------------------------------------------------

const testDirPath = resolve(__dirname);
const testNodemodulesPath = resolve(testDirPath, './node_modules');

const runTypeDone = (opts: string = '') => {
  // * clear node_modules
  fs.existsSync(testNodemodulesPath) && rimraf.sync(testNodemodulesPath);

  // * prepare
  execSync(`cd ${testDirPath}; cp package.origin.json package.json;`);

  // // * npm install
  // execSync(`cd ${currentDir}; ${argv.tool} install`, { stdio: 'inherit' });

  execSync(
    // `cd ${testDirPath}; ../../node_modules/ts-node/dist/bin.js ../../src/app.ts ${opts} -s`,
    `cd ${testDirPath}; node ../../dist/app.js ${opts} -s`,
    { stdio: 'inherit' },
  );
};

// * ----------------------------------------------------------------

const readPkg = (p: string) => jsonfile.readFileSync(resolve(testDirPath, p));

const jsonOrigin = readPkg('./package.origin.json');

const jsonResultShouldMatch = (jsonTarget: any) => {
  const jsonResult = readPkg('./package.json');

  const listDeps = (pkg: any, field: string) => Object.keys(pkg[field]);
  // .sort((a, b) => (a < b ? -1 : 1));

  expect(listDeps(jsonResult, 'devDependencies')).toEqual(
    listDeps(jsonTarget, 'devDependencies'),
  );
  expect(listDeps(jsonResult, 'dependencies')).toEqual(
    listDeps(jsonTarget, 'dependencies'),
  );
};

// * ----------------------------------------------------------------

describe('run test', () => {
  test('should run correctly', () => {
    runTypeDone();
    jsonResultShouldMatch(readPkg('./package.default-result.json'));
  });

  test('dry run', () => {
    runTypeDone('-d');
    jsonResultShouldMatch(jsonOrigin);
  });

  test('skip add', () => {
    runTypeDone('--skip-add');
    jsonResultShouldMatch(readPkg('./package.skip-add.json'));
  });

  test('skip uninstall', () => {
    runTypeDone('--skip-remove');
    jsonResultShouldMatch(readPkg('./package.skip-remove.json'));
  });

  test('skip sort', () => {
    runTypeDone('--skip-sort');
    jsonResultShouldMatch(readPkg('./package.skip-sort.json'));
  });

  test('mix dry 1', () => {
    runTypeDone('-d --skip-add');
    jsonResultShouldMatch(jsonOrigin);
  });

  test('mix dry 2', () => {
    runTypeDone('-d --skip-remove');
    jsonResultShouldMatch(jsonOrigin);
  });

  test('mix dry 3', () => {
    runTypeDone('-d --skip-sort --skip-add --skip-remove');
    jsonResultShouldMatch(jsonOrigin);
  });

  test('skip everything', () => {
    runTypeDone('--skip-sort --skip-add --skip-remove');
    jsonResultShouldMatch(jsonOrigin);
  });
});
