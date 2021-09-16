import jsonfile from 'jsonfile';
import sortKeys from 'sort-keys';
import { isTypes } from './nameMapper';
import { argv } from './parseCliArgs';
import { PatchBundle } from './types';

export const updatePackageJson = async (
  pkgPath: string,
  pkgJson: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  },
  { deprecatedTypes, unusedTypes, usefulTypes }: PatchBundle,
) => {
  if (!argv['skip-add']) {
    usefulTypes.forEach((e) => {
      pkgJson.devDependencies[e.pkgName] = `^${e.lastVer}`;
    });
  }

  if (!argv['skip-remove']) {
    deprecatedTypes.forEach((e) => {
      delete pkgJson.dependencies[e.pkgName];
      delete pkgJson.devDependencies[e.pkgName];
    });
    unusedTypes.forEach((e) => {
      delete pkgJson.dependencies[e];
      delete pkgJson.devDependencies[e];
    });
  }

  if (!argv['skip-sort']) {
    Object.keys(pkgJson.dependencies).forEach((e) => {
      if (isTypes(e)) {
        pkgJson.devDependencies[e] = pkgJson.dependencies[e];
        delete pkgJson.dependencies[e];
      }
    });
    pkgJson.dependencies = sortKeys(pkgJson.dependencies);
    pkgJson.devDependencies = sortKeys(pkgJson.devDependencies);
  }

  await jsonfile.writeFile(pkgPath, pkgJson, { spaces: 2 });
};
