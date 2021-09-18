import commandExists from 'command-exists';
import { existsSync } from 'fs';
import jsonfile from 'jsonfile';
import { dirname, resolve } from 'path';
import yargs from 'yargs';

// * ----------------------------------------------------------------

export const NPM_MANAGER_LIST = ['yarn', 'tnpm', 'pnpm', 'npm'] as const;

const DEFAULT_MANAGER =
  NPM_MANAGER_LIST.find((tool) => commandExists.sync(tool)) ?? 'npm';

const DEFAULT_PARALLEL = 10;

// * ----------------------------------------------------------------

// ! a bit tricky // Seognil LC 2021/09/18
const getTypeDonePkgVersion = () => {
  let searchRoot = dirname(new URL(import.meta.url).pathname);
  let pkgFile = resolve(searchRoot, './package.json');

  let failedCount = 0;
  while (!existsSync(pkgFile)) {
    searchRoot = dirname(searchRoot);
    pkgFile = resolve(searchRoot, './package.json');

    failedCount++;
    if (failedCount > 10) return 'unknown';
  }

  return jsonfile.readFileSync(pkgFile).version as string;
};

// * ----------------------------------------------------------------

export const argv = yargs(process.argv.slice(2))
  .version(getTypeDonePkgVersion())
  .options({
    'tool': {
      alias: 't',
      describe: 'Which package manager to use',
      default: DEFAULT_MANAGER,
      type: 'string',
    },
    'skip-add': {
      describe: 'Skip add missing @types',
      default: false,
      type: 'boolean',
    },
    'skip-remove': {
      describe: 'Skip removing unuseful @types',
      default: false,
      type: 'boolean',
    },
    'skip-sort': {
      describe: 'Skip sorting dependencies',
      default: false,
      type: 'boolean',
    },
    'skip-install': {
      alias: 's',
      describe: 'Skip run install after analyzed',
      default: false,
      type: 'boolean',
    },
    'dry-run': {
      alias: 'd',
      describe: 'Analyze only',
      default: false,
      type: 'boolean',
    },
    'parallel': {
      alias: 'p',
      describe: 'Set maximum number of parallel fetch tasks',
      default: DEFAULT_PARALLEL,
      type: 'number',
    },
  })
  .parseSync();
