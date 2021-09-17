import jsonfile from 'jsonfile';
import pkgUp from 'pkg-up';
import { PkgJsonObj } from './types';

export const pkgPath = (() => {
  const pkgPath = pkgUp.sync();

  if (pkgPath === null) {
    console.error('No package.json file found!');
    process.exit();
  }

  return pkgPath;
})();

export const pkgJson = jsonfile.readFileSync(pkgPath) as PkgJsonObj;

// @ts-ignore
export const pkgVersion = pkgJson.version as string;
