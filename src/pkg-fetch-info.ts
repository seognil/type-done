import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import registryUrl from 'registry-url';

const execAsync = promisify(exec);

const globalRegistry = registryUrl();

const fetchFromWeb = async (
  name: string,
): Promise<{ name: string; found: boolean }> => {
  const url = `${globalRegistry}/${name}`.replace(/(?<!:)\/\//, '/');

  const found = await axios(url)
    .then((resp) => resp.status === 200)
    .catch(() => false);

  return { name, found };
};

const fetchFromInfo = async (
  name: string,
): Promise<{ name: string; useful: boolean; deprecated: boolean }> => {
  const { stdout } = await execAsync(
    `npm view ${name} name deprecated version --json`,
  ).catch(() => ({ stdout: '{}' }));

  const { version, deprecated } = JSON.parse(stdout);
  const useful = version !== undefined && !deprecated;
  return { name, useful, deprecated: Boolean(deprecated) };
};

export const fetchList = async (
  list: string[],
): Promise<{
  deprecated: string[];
  useful: string[];
}> => {
  // const webList = await Promise.all(list.map((name) => fetchFromWeb(name)));
  // const founds = webList.filter((e) => e.found).map((e) => e.name);

  const infoList = await Promise.all(list.map((name) => fetchFromInfo(name)));
  const deprecated = infoList.filter((e) => e.deprecated).map((e) => e.name);
  const useful = infoList.filter((e) => e.useful).map((e) => e.name);

  return { deprecated, useful };
};
