import args from 'args';
import commandExists from 'command-exists';

const tools = {
  yarn: { install: `yarn add -D`, uninstall: `yarn remove` },
  npm: { install: `npm install -D`, uninstall: `npm uninstall` },
};

const defaultTool = Object.keys(tools).find((tool) => commandExists.sync(tool));
if (defaultTool === undefined) {
  console.error("Couldn't find a supported package manager tool");
  console.error('Have you installed Node.js?');
  process.exit();
}

// * manually choosing
args.option('tool', 'Which package manager tool to use', defaultTool);
const opts = args.parse(process.argv, {
  name: 'type-done',
  mri: {},
  mainColor: 'yellow',
  subColor: 'dim',
});

export const tool = opts.tool as keyof typeof tools;

export const toolCommand = tools[tool];
