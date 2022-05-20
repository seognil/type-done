import chalk from 'chalk';
import meow from 'meow';
import { SearchMode } from '../types';

// * ---------------------------------------------------------------- const

const title = (str: string) => chalk.dim(str);
const code = (str: string) => chalk.dim(`\`${str}\``);
const under = (str: string) => chalk.underline(str);

const DEFAULT_PARALLEL = 10;

// * ---------------------------------------------------------------- commander

export const command = meow(
  // prettier-ignore
  `
  ${chalk.bold('type-done')} [glob-path...] [options]

  ${title('Options:')}

    ${title('Basic')}

    -L, --latest            Only using the latest version of each '@types' packages (useful while installing ${code('@types/node')})
    -t, --tool              Which package manager to use [default: auto detected by checking lock file by ${code('@antfu/ni')} ]
    -p ${under('NUM')}, --parallel=${under('NUM')}  Maximum number of parallel fetch tasks [default: 10]
    -d, --dry-run           Do not touch or write anything, but show the progress

    -h, --help              Show help
    -v, --version           Show version number
    -V, --verbose           Verbose mode

    ${title('Multiple Projects Search Mode')}

      --mode=${under('MODE')}           [recursive/workspace], [default: still support multiple paths but the search will stop at each 'package.json']
      -r                    Recursive mode (same as ${code('--mode=recursive')}), search 'package.json' recursively (deep nested, excludes ${code('node_modules/')})
      -w                    Workspace mode (same as ${code('--mode=workspace')}), check workspace configs (shallow) while searching
    
    ${title('@types/node')}

      -n, --node            Also install @types/node [default: off]
      -N, --node-only       Only install @types/node but skip checking other deps

    ${title('Install Steps')}

      --skip-add            Skip add missing @types
      --skip-remove         Skip removing unuseful @types
      --skip-sort           Skip sorting dependencies
      -s, --skip-install    Skip run install after analyzed

  ${title('Examples:')}

  – Search 'package.json' up and check '@types' for dependencies

    ${chalk.cyan('$ type-done')}

  – Install the latest version of ${code('@types/node')}

    ${chalk.cyan('$ type-done -NL')}

  – Workspace mode (support 'workspaces' field in package.json (for npm, yarn) or 'pnpm-workspace.yaml')

    ${chalk.cyan('$ type-done -w')}

  – Use another package manager

    ${chalk.cyan('$ type-done -t tnpm')} ${chalk.dim('# will run `tnpm install` after analyzed')}

  – Run in another projects, skip remove unuseful '@types', skip install (just update 'package.json')
  
    ${chalk.cyan(`$ type-done ./website '**/{packages,scripts}/**' -s --skip-remove -p 20`)}


  `.trimEnd(),
  {
    importMeta: import.meta,
    flags: {
      latest: { type: 'boolean', alias: 'L' },
      tool: { type: 'string', alias: 't' },
      parallel: { type: 'number', alias: 'p', default: DEFAULT_PARALLEL },
      dryRun: { type: 'boolean', alias: 'd' },
      help: { type: 'boolean', alias: 'h' },
      version: { type: 'boolean', alias: 'v' },
      verbose: { type: 'boolean', alias: 'V' },

      mode: { type: 'string' },
      w: { type: 'boolean' },
      r: { type: 'boolean' },

      node: { type: 'boolean', alias: 'n' },
      nodeOnly: { type: 'boolean', alias: 'N' },

      skipAdd: { type: 'boolean' },
      skipRemove: { type: 'boolean' },
      skipSort: { type: 'boolean' },
      skipInstall: { type: 'boolean', alias: 's' },
    },
  },
);

// * ---------------------------------------------------------------- flags patch

const modes: SearchMode[] = ['recursive', 'workspace'];

export const SEARCH_MODE: SearchMode = modes.includes((command.flags.mode ?? '') as SearchMode)
  ? (command.flags.mode as SearchMode)
  : command.flags.r
  ? 'recursive'
  : command.flags.w
  ? 'workspace'
  : 'normal';

export const VERBOSE_MODE = command.flags.verbose ?? false;

command.flags.mode = SEARCH_MODE;
