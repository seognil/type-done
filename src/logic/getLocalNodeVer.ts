import { readFile } from 'fs/promises';
import { join } from 'node:path';
import type { DirPath, SemVer } from '../types';
import { memo } from '../utils/memo';

/** fnm nvm or current */
export const getLocalNodeVer = memo(async (dir: DirPath | undefined): Promise<SemVer> => {
  if (!dir) return process.version;

  const dirNodeVer = await readFile(join(dir, '.node_version'), 'utf-8')
    .catch(() => readFile(join(dir, '.nvmrc'), 'utf-8'))
    .catch(() => null);

  return dirNodeVer ?? process.version;
});
