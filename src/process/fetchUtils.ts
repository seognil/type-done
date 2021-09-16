import fetch from 'node-fetch';
import pLimit from 'p-limit';
import registryUrl from 'registry-url';
import { argv } from './parseCliArgs';
import { PkgInfo } from './types';

// * default is: https://registry.npmjs.org/
const globalRegistry = registryUrl();

const limit = pLimit(argv.parallel);

// * ----------------

export const fetchSingle = async (
  pkgName: string,
  tick?: (depName: string) => void,
): Promise<PkgInfo> => {
  const url = `${globalRegistry}/${pkgName}`.replace(/(?<!:)\/\//, '/');

  const res = (await fetch(url)
    .then((e) => e.json())
    .catch(() => {
      'Not found';
      tick?.(pkgName);
    })) as any;

  const lastVer = res?.['dist-tags']?.latest;
  const isDeprecated = res?.versions?.[lastVer]?.deprecated !== undefined;
  const isUseful = lastVer !== undefined && !isDeprecated;

  tick?.(pkgName);
  return { pkgName, lastVer, isUseful, isDeprecated };
};

// * ----------------

export const fetchList = async (
  depslist: string[],
  tick?: (depName: string) => void,
): Promise<{
  deprecatedTypes: PkgInfo[];
  usefulTypes: PkgInfo[];
}> => {
  const results = await Promise.all(
    depslist.map((name) => limit(() => fetchSingle(name, tick))),
  );

  const deprecatedTypes = results.filter((e) => e.isDeprecated);

  const usefulTypes = results.filter((e) => e.isUseful);

  return { deprecatedTypes, usefulTypes };
};
