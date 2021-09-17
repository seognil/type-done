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
  const hasDepsObj = pkgJson.dependencies !== undefined;
  const hasDevDepsObj = pkgJson.devDependencies !== undefined;

  if (!pkgJson.dependencies) pkgJson.dependencies = {};
  if (!pkgJson.devDependencies) pkgJson.devDependencies = {};

  const deps = pkgJson.dependencies;
  const devDeps = pkgJson.devDependencies;

  // * ---------------- skips

  if (!argv['skip-add']) {
    usefulTypes.forEach((e) => {
      devDeps[e.pkgName] = `^${e.lastVer}`;
    });
  }

  if (!argv['skip-remove']) {
    deprecatedTypes.forEach((e) => {
      delete deps[e.pkgName];
      delete devDeps[e.pkgName];
    });
    unusedTypes.forEach((e) => {
      delete deps[e];
      delete devDeps[e];
    });
  }

  if (!argv['skip-sort']) {
    Object.keys(deps).forEach((e) => {
      if (isTypes(e)) {
        devDeps[e] = deps[e];
        delete deps[e];
      }
    });

    pkgJson.dependencies = sortKeys(deps);
    pkgJson.devDependencies = sortKeys(devDeps);
  }

  // * ---------------- minimal change cleanup

  if (!hasDepsObj && Object.keys(deps).length === 0) {
    delete pkgJson.dependencies;
  }
  if (!hasDevDepsObj && Object.keys(devDeps).length === 0) {
    delete pkgJson.devDependencies;
  }

  // * ---------------- update

  await jsonfile.writeFile(pkgPath, pkgJson, { spaces: 2 });
};
