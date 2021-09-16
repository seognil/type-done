import commandExists from 'command-exists';
import yargs from 'yargs';

// * ----------------------------------------------------------------

export const NPM_MANAGER_LIST = ['yarn', 'tnpm', 'pnpm', 'npm'] as const;

const DEFAULT_MANAGER =
  NPM_MANAGER_LIST.find((tool) => commandExists.sync(tool)) ?? 'npm';

const DEFAULT_PARALLEL = 10;

// * ----------------------------------------------------------------

export const argv = yargs(process.argv.slice(2))
  .options({
    'tool': {
      alias: 't',
      describe: 'Which package manager to use',
      default: DEFAULT_MANAGER,
      type: 'string',
    },
    'skip-add': {
      describe: 'Skip checking missing deps',
      default: false,
      type: 'boolean',
    },
    'skip-remove': {
      describe: 'Skip checking unuseful deps',
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
      describe: 'Skip npm install',
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
