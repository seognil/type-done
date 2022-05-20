import fetch from 'node-fetch';
import { DirPath, PkgNpmInfo } from '../types';
import { getLocalRegistry } from './getLocalRegistry';

export const fetchPkgInfo = async (dir: DirPath | undefined, pkgName: string): Promise<PkgNpmInfo | null> => {
  const registry = await getLocalRegistry(dir);

  const url = `${registry.replace(/\/$/, '')}/${pkgName}`;

  const res = await fetch(url)
    .then((e) => e.json() as Promise<PkgNpmInfo>)
    .catch(() => null);

  const valid = res?.name && res?.versions.length;
  return valid ? res : null;
};
