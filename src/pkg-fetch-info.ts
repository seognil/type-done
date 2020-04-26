import fetch from 'node-fetch';
import registryUrl from 'registry-url';
import { Ora } from 'ora';

// * default is: https://registry.npmjs.org/
const globalRegistry = registryUrl();

// * ----------------

export const fetchSingle = async (
  name: string,
  spinner?: Ora,
): Promise<{
  name: string;
  useful: boolean;
  deprecated: boolean;
}> => {
  const url = `${globalRegistry}/${name}`.replace(/(?<!:)\/\//, '/');

  const res = await fetch(url).then((e) => e.json());
  const deprecated = Object.values(res?.versions ?? {}).some(
    (e: any) => e.deprecated !== undefined,
  );
  const useful = res?.versions !== undefined && !deprecated;

  if (spinner) spinner.text = name;
  return { name, useful, deprecated };
};

// * ----------------

export const fetchList = async (
  list: string[],
  spinner?: Ora,
): Promise<{
  deprecated: string[];
  useful: string[];
}> => {
  const results = await Promise.all(
    list.map((name) => fetchSingle(name, spinner)),
  );
  const deprecated = results.filter((e) => e.deprecated).map((e) => e.name);
  const useful = results.filter((e) => e.useful).map((e) => e.name);

  return { deprecated, useful };
};
