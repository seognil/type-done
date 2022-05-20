import { exec } from 'child_process';
import type { DirPath, UrlLink } from '../types';
import { memo } from '../utils/memo';

/** use native method `npm config get registry` */
export const getLocalRegistry = memo(
  async (dir: DirPath | undefined): Promise<UrlLink> =>
    new Promise((res) => {
      exec(`npm config get registry`, { cwd: dir }, (err, stdout, stderr) => {
        res(stdout.trim());
      });
    }),
);
