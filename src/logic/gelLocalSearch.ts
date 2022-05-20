import { findUp } from 'find-up';
import { globby } from 'globby';
import { dirname, join } from 'node:path';
import type { DirPath, ProjectInfo, SingleProjectInfo, WorkspaceProjectInfo } from '../types';
import { uniqNotNull } from '../utils/uniq';
import { SEARCH_MODE } from './command';
import { parseIfDirWorkspace } from './parseWorkspace';

// * ----------------------------------------------------------------

export const searchProjects = async (paths: DirPath[]): Promise<ProjectInfo[]> => {
  const searchProjectTasks = paths.map(async (dir) => {
    if (SEARCH_MODE === 'recursive') {
      return await searchRecursiveProjects(dir);
    } else if (SEARCH_MODE === 'workspace') {
      // * if no workspace found, fall back to single mode
      return (await searchWorkspaceProjects(dir)) ?? (await searchSingleProject(dir));
    } else {
      return await searchSingleProject(dir);
    }
  });

  const uniqedWorkspaceInfos = uniqNotNull((await Promise.all(searchProjectTasks)).flat(), (e) => e.dir);
  return uniqedWorkspaceInfos;
};

// * ----------------------------------------------------------------

export const searchRecursiveProjects = async (dir: DirPath): Promise<SingleProjectInfo[]> => {
  const searchResult = await globby(join(dir, './**/package.json'), { ignore: ['**/node_modules/**'] });

  return searchResult.map((file) => ({
    type: 'single-project',
    workspace: false,
    dir: dirname(file),
    package: file,
  }));
};

export const searchWorkspaceProjects = async (dir: DirPath): Promise<WorkspaceProjectInfo | null> => {
  let workspaceProjectInfo: WorkspaceProjectInfo | null = null;

  await findUp(
    async (dir) => {
      const result = await parseIfDirWorkspace(dir);
      if (result === null) return undefined;

      workspaceProjectInfo = result;
      return result.dir;
    },
    { cwd: dir },
  );

  return workspaceProjectInfo as WorkspaceProjectInfo | null;
};

// * ----------------------------------------------------------------

export const searchSingleProject = async (dir: DirPath): Promise<SingleProjectInfo | null> => {
  const pkgJsonFilePath = await findUp('package.json', { cwd: dir });

  if (!pkgJsonFilePath) return null;

  return {
    type: 'single-project',
    workspace: false,
    dir: dirname(pkgJsonFilePath),
    package: pkgJsonFilePath,
  };
};
