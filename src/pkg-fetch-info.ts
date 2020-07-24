import fetch from 'node-fetch';
import registryUrl from 'registry-url';
import pLimit from 'p-limit';
import { argv } from './parse-args';

// * default is: https://registry.npmjs.org/
const globalRegistry = registryUrl();

const limit = pLimit(argv.c);

// * ----------------

export const fetchSingle = async (
  name: string,
  cb?: (name: string) => void,
): Promise<{
  name: string;
  useful: boolean;
  deprecated: boolean;
}> => {
  const url = `${globalRegistry}/${name}`.replace(/(?<!:)\/\//, '/');

  const res = await fetch(url)
    .then((e) => e.json())
    .catch(() => ({ error: 'Not found' }));

  const latestVer = res?.['dist-tags']?.latest;
  const deprecated = res?.versions?.[latestVer]?.deprecated !== undefined;
  const useful = latestVer !== undefined && !deprecated;

  cb?.(name);
  return { name, useful, deprecated };
};

// * ----------------

export const fetchList = async (
  list: string[],
  cb?: (name: string) => void,
): Promise<{
  deprecated: string[];
  useful: string[];
}> => {
  const results = await Promise.all(
    list.map((name) => limit(() => fetchSingle(name, cb))),
  );
  const deprecated = results.filter((e) => e.deprecated).map((e) => e.name);
  const useful = results.filter((e) => e.useful).map((e) => e.name);

  return { deprecated, useful };
};
