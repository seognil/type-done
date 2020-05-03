import args from 'args';

import commandExists from 'command-exists';

// * ----------------------------------------------------------------

export const tools = {
  yarn: { install: `yarn add -D`, uninstall: `yarn remove` },
  npm: { install: `npm install -D`, uninstall: `npm uninstall` },
};

const defaultTool = Object.keys(tools).find((tool) => commandExists.sync(tool));
if (defaultTool === undefined) {
  console.error("Couldn't find a supported package manager tool");
  console.error('Have you installed Node.js?');
  process.exit();
}

// * ----------------------------------------------------------------

args.option('tool', 'Which manager to use', defaultTool);
args.option('install-only', 'Skip uninstall step');
args.option('uninstall-only', 'Skip install step');
args.option('dry-run', 'Only do analyze, skip run npm');

const res = args.parse(process.argv, {
  name: 'type-done',
  mri: {},
  mainColor: 'bold',
  subColor: 'dim',
}) as {
  tool: keyof typeof tools;
  i?: true;
  u?: true;
  d?: true;
};

const { i, u } = res;

export const argv = {
  tool: res.tool,
  i: !(u && !i),
  u: !(i && !u),
  dry: res.d === true,
};
