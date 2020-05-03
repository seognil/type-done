import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
// import { argv } from '../../src/parse-args';
import rimraf from 'rimraf';

// * ----------------------------------------------------------------

const currentDir = path.resolve(__dirname);
const nodeModules = path.resolve(currentDir, './node_modules');

const runTypeDone = (opts: string = '') => {
  // * clear node_modules
  fs.existsSync(nodeModules) && rimraf.sync(nodeModules);

  // * prepare
  execSync(`cd ${currentDir}; cp package.origin.json package.json;`);

  // // * npm install
  // execSync(`cd ${currentDir}; ${argv.tool} install`, { stdio: 'inherit' });

  execSync(
    `cd ${currentDir}; ../../node_modules/ts-node/dist/bin.js ../../src/app.ts ${opts}`,
    {
      stdio: 'inherit',
    },
  );
};

// * ----------------------------------------------------------------

const readPkg = (file: string) =>
  JSON.parse(fs.readFileSync(path.resolve(currentDir, file), 'utf8'));

const jsonOrigin = readPkg('./package.origin.json');
const jsonExp = readPkg('./package.expect.json');
const jsonInstall = readPkg('./package.install.json');
const jsonUninstall = readPkg('./package.uninstall.json');

const listDeps = (pkg: any, field: string) =>
  Object.keys(pkg[field]).sort((a, b) => (a < b ? -1 : 1));

const jsonShouldMatch = (jsonTarget: any) => {
  const jsonResult = readPkg('./package.json');

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
    jsonShouldMatch(jsonExp);
  });

  test('dry run', () => {
    runTypeDone('-d');
    jsonShouldMatch(jsonOrigin);
  });

  test('install only', () => {
    runTypeDone('-i');
    jsonShouldMatch(jsonInstall);
  });

  test('uninstall only', () => {
    runTypeDone('-u');
    jsonShouldMatch(jsonUninstall);
  });

  test('mix ud', () => {
    runTypeDone('-ud');
    jsonShouldMatch(jsonOrigin);
  });

  test('mix id', () => {
    runTypeDone('-id');
    jsonShouldMatch(jsonOrigin);
  });

  test('mix iu', () => {
    runTypeDone('-iu');
    jsonShouldMatch(jsonExp);
  });
});
