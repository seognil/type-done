// * ----------------

export type DirPath = string & {};
export type FilePath = string & {};
export type GlobPath = string & {};

export type PkgJsonFilePath = string & {};

export type UrlLink = string & {};
export type SemVer = string & {};

export type PkgName = string & {};

export type SearchMode = 'recursive' | 'workspace' | 'normal';

// * ---------------- workspace

export type ProjectInfo = WorkspaceProjectInfo | SingleProjectInfo;

export interface SingleProjectInfo {
  type: 'single-project';
  workspace: false;
  dir: DirPath;
  package: PkgJsonFilePath;
}

export type WorkspaceProjectInfo = NpmWorkspaceInfo | PnpmWorkspaceInfo;

export interface NpmWorkspaceInfo {
  type: 'npm-workspace';
  workspace: true;
  dir: DirPath;
  config: { file: FilePath; data: PkgJsonObj };
  packages: PkgJsonFilePath[];
}

export interface PnpmWorkspaceInfo {
  type: 'pnpm-workspace';
  workspace: true;
  dir: DirPath;
  config: { file: FilePath; data: YamlObj };
  packages: PkgJsonFilePath[];
}

// * ---------------- parse file

export interface PkgJsonObj {
  // name: string;
  version?: SemVer;
  // main: string;
  types?: FilePath;
  typings?: FilePath;

  dependencies?: Record<PkgName, SemVer>;
  devDependencies?: Record<PkgName, SemVer>;

  workspaces?: string[];
}

export interface YamlObj {
  packages?: GlobPath[];
}

// * ---------------- package.json fetch result

export interface PkgNpmInfo {
  'name': PkgName;
  'dist-tags': {
    latest: SemVer;
  };
  'versions': {
    [ver: SemVer]: {
      name: PkgName;
      version: SemVer;

      // * This is a stub types definition. xxx provides its own type definitions, so you do not need this installed.
      deprecated?: string;
    };
  };
}

// * ----------------

export interface PkgInfo {
  pkgName: string;
  lastVer: string;
  isUseful?: boolean;
  isDeprecated?: boolean;
}

export interface PatchBundle {
  deprecatedTypes: PkgInfo[];
  unusedTypes: string[];
  usefulTypes: PkgInfo[];
}
