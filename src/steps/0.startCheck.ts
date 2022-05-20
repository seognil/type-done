import chalk from 'chalk';
import commandExists from 'command-exists';
import { command, VERBOSE_MODE } from '../logic/command';
import { iconWarning } from '../utils/figures';

export const cliStartCheck = () => {
  if (command.flags.dryRun) console.log(`${iconWarning} dry-run mode`);

  if (VERBOSE_MODE) {
    console.log(`${chalk.bold('type-done')} --verbose`);
    console.log(`v${command.pkg.version}\n`);
  }

  const tool = command.flags.tool;

  if (tool && !commandExists.sync(tool)) {
    console.error(`${chalk.red('[Error]')}: '${tool} install' command failed`);
    process.exit();
  }
};
