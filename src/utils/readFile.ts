import { pathExists } from 'find-up';
import jsonfile from 'jsonfile';
import { readFile } from 'node:fs/promises';
import yaml from 'yaml';
import type { FilePath, PkgJsonObj, YamlObj } from '../types';
import { memo } from './memo';

// * ----------------------------------------------------------------

export const readJson = memo(async (filePath: FilePath): Promise<PkgJsonObj | null> => {
  const exist = await pathExists(filePath);
  if (!exist) return null;

  return (await jsonfile.readFile(filePath)) as PkgJsonObj;
});

// * ----------------------------------------------------------------

export const readYaml = memo(async (filePath: FilePath): Promise<YamlObj | null> => {
  const exist = await pathExists(filePath);
  if (!exist) return null;

  const content = await readFile(filePath, 'utf-8');
  return yaml.parse(content) as YamlObj;
});
