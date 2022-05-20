import compareVersions, { satisfies } from 'compare-versions';
import type { PkgName, SemVer } from '../types';
import { memo } from '../utils/memo';

export const findLatestValidSemVer = memo(
  (pkgName: PkgName, target: SemVer, versions: SemVer[]): SemVer => {
    const sortedVersions = versions.sort((a, b) => -compareVersions(a, b));
    return sortedVersions.find((e) => satisfies(e, target))!;
  },
  { memoBy: (pkgName, target, versions) => `${pkgName}@${target}` },
);
