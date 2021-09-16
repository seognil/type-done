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

export interface PkgJsonObj {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
