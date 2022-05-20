import { resolve } from 'node:path';
import { command, SEARCH_MODE, VERBOSE_MODE } from '../logic/command';
import { searchProjects } from '../logic/gelLocalSearch';
import { iconWarning } from '../utils/figures';

// * ----------------------------------------------------------------

export const searchProjectsWithLog = async () => {
  const searchPaths = command.input.length > 0 ? command.input : [process.cwd()];

  const searchResult = await searchProjects(searchPaths);

  const projCount = searchResult.map((e) => (e.workspace ? e.packages : e.package)).flat().length;

  const wsCount = searchResult.filter((e) => e.workspace).length;

  const toPcStr = (count: number) => (count > 0 ? `${count} ${count > 1 ? 'projects' : 'project'}` : '');
  const pcStr = toPcStr(projCount);
  const wcStr = wsCount > 0 ? `${wsCount} ${wsCount > 1 ? 'workspaces' : 'workspace'}` : '';

  // * ----------------

  if (projCount === 0) {
    if (!VERBOSE_MODE) {
      console.warn(`${iconWarning} No projects found. Exit without any changes.`);
    } else {
      console.warn(`${iconWarning} No projects found based on the input directories${wcStr ? ' ' + wcStr : ''}:\n`);
      console.warn(searchPaths.map((e) => `  - ${resolve(e)}`).join('\n'));
      console.warn(`Exit without any changes.`);
    }

    return process.exit();
  } else {
    if (!VERBOSE_MODE) {
      console.log(`Found ${pcStr}${wcStr ? ` (with ${wcStr})` : ''}`);
    } else {
      if (SEARCH_MODE !== 'normal') console.log(`Search mode: ${SEARCH_MODE}\n`);

      console.log(`Found ${pcStr}${wcStr ? ` (with ${wcStr})` : ''} at:\n`);

      console.log(
        searchResult
          .map((e) =>
            e.workspace
              ? //
                `  - ${resolve(e.dir)} (workspace: ${toPcStr(e.packages.length)})`
              : `  - ${resolve(e.dir)}`,
          )
          .join('\n'),
      );
    }
  }

  return searchResult;
};
