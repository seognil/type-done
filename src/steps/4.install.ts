import { execSync } from 'child_process';
import { command } from '../logic/command';

const tool = command.flags.tool;

export const install = () => {
  // * https://github.com/antfu/ni
  try {
    execSync(tool ? `${tool} install` : `npx ni`, { stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
};
