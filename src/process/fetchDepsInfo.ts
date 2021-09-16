import chalk from 'chalk';
import ora from 'ora';
import registryUrl from 'registry-url';
import { fetchList } from './fetchUtils';

export const fetchDepsInfo = async ({
  installedTypes,
  missedTypes,
}: {
  installedTypes: string[];
  missedTypes: string[];
}) => {
  const globalRegistry = registryUrl();
  console.log(`registry: "${globalRegistry}"`);

  const spinner = ora('Fetching...').start();

  let count = 0;
  const fetchLen = installedTypes.length + missedTypes.length;
  const updateSpinner = (depName: string) => {
    spinner.prefixText = chalk.gray(`[${++count}/${fetchLen}]`);
    spinner.text = `Checking ${depName} ...`;
  };

  const [{ deprecatedTypes }, { usefulTypes }] = await Promise.all([
    fetchList(installedTypes, updateSpinner),
    fetchList(missedTypes, updateSpinner),
  ]);

  spinner.stop();
  return { deprecatedTypes, usefulTypes };
};
