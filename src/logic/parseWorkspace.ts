import { globby } from 'globby';
import { join } from 'node:path';
import type { DirPath, FilePath, GlobPath, PkgJsonFilePath, PkgJsonObj, WorkspaceProjectInfo, YamlObj } from '../types';
import { memo } from '../utils/memo';
import { readJson, readYaml } from '../utils/readFile';

// * ----------------------------------------------------------------

export const parseIfDirWorkspace = memo(async (dir: DirPath): Promise<WorkspaceProjectInfo | null> => {
  {
    const yamlPath = join(dir, 'pnpm-workspace.yaml');
    const yamlObj = await parseWorkspaceByYaml(yamlPath);
    if (yamlObj) {
      return {
        type: 'pnpm-workspace',
        workspace: true,
        dir,
        config: { file: yamlPath, data: yamlObj },
        packages: await searchWorkspacePackages(dir, yamlObj.packages),
      };
    }
  }

  {
    const jsonPath = join(dir, 'package.json');
    const jsonObj = await parseWorkspaceByJson(jsonPath);
    if (jsonObj) {
      return {
        type: 'npm-workspace',
        workspace: true,
        dir,
        config: { file: jsonPath, data: jsonObj },
        packages: await searchWorkspacePackages(dir, jsonObj.workspaces),
      };
    }
  }

  return null;
});

// * ----------------------------------------------------------------

const searchWorkspacePackages = memo(
  async (dir: DirPath, list?: GlobPath[]): Promise<PkgJsonFilePath[]> =>
    globby(
      [
        //
        join(dir, './package.json'),
        ...(list ?? []).map((e) => join(dir, e, './**/package.json')),
      ],
      { ignore: ['**/node_modules/**'] },
    ),
  { memoBy: (dir, list) => dir },
);

// * ---------------------------------------------------------------- pnpm, pnpm-workspace.yaml

const parseWorkspaceByYaml = memo(async (yamlPath: FilePath): Promise<YamlObj | null> => {
  const yaml = await readYaml(yamlPath);
  return yaml?.packages ? yaml : null;
});

// * ---------------------------------------------------------------- npm, yarn, package.json

const parseWorkspaceByJson = memo(async (pkgPath: FilePath): Promise<PkgJsonObj | null> => {
  const json = await readJson(pkgPath);
  return json?.workspaces ? json : null;
});
