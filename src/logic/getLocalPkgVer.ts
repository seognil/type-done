import { join } from 'node:path';
import type { DirPath, PkgName, SemVer } from '../types';
import { memo } from '../utils/memo';
import { readJson } from '../utils/readFile';

/**
 * @description analyze node_modules, or semver latest
 * @todo lock file not support yet
 */
export const getLocalPkgVer = memo(async (dir: DirPath, pkgName: PkgName): Promise<SemVer | null> => {
  const installedVer = (await readJson(join(dir, `./node_modules/${pkgName}`)))?.version;

  const pkgJson = await readJson(join(dir, './package.json'));
  const pkgVer = pkgJson?.dependencies?.[pkgName] ?? pkgJson?.devDependencies?.[pkgName];

  return installedVer ?? pkgVer ?? null;
});
