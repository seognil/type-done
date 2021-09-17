import jsonfile from 'jsonfile';
import sortKeys from 'sort-keys';
import { isTypes } from './nameMapper';
import { argv } from './parseCliArgs';
import { pkgJson, pkgPath } from './readPkgJson';
import { PatchBundle } from './types';

export const updatePackageJson = async ({
  deprecatedTypes,
  unusedTypes,
  usefulTypes,
}: PatchBundle) => {
  if (!pkgJson.dependencies) pkgJson.dependencies = {};
  if (!pkgJson.devDependencies) pkgJson.devDependencies = {};

  const dependencies = pkgJson.dependencies;
  const devDependencies = pkgJson.devDependencies;

  // * ----------------

  if (!argv['skip-add']) {
    usefulTypes.forEach((e) => {
      devDependencies[e.pkgName] = `^${e.lastVer}`;
    });
  }

  if (!argv['skip-remove']) {
    deprecatedTypes.forEach((e) => {
      delete dependencies[e.pkgName];
      delete devDependencies[e.pkgName];
    });
    unusedTypes.forEach((e) => {
      delete dependencies[e];
      delete devDependencies[e];
    });
  }

  if (!argv['skip-sort']) {
    Object.keys(dependencies).forEach((e) => {
      if (isTypes(e)) {
        devDependencies[e] = dependencies[e];
        delete dependencies[e];
      }
    });

    pkgJson.dependencies = sortKeys(pkgJson.dependencies);
    pkgJson.devDependencies = sortKeys(pkgJson.devDependencies);
  }

  await jsonfile.writeFile(pkgPath, pkgJson, { spaces: 2 });
};
