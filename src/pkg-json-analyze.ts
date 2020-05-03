import { dep2type, isTypes } from './pkg-name-map';
import { patch } from './patch';

type PkgDepsObj = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export const parsePkgTypes = (pkgJson: PkgDepsObj) => {
  const { dependencies: deps = {}, devDependencies: devDeps = {} } = pkgJson;

  const sorter = (a: string, b: string) => (a < b ? -1 : 1);

  // * ----------------

  // * manually add `node` for `@types/node`
  const allDepPkgs = ['node', ...Object.keys(deps), ...Object.keys(devDeps)];

  allDepPkgs
    .filter((e) => patch[e])
    .forEach((e) => allDepPkgs.push(...patch[e]));

  const allCandidateTypes = allDepPkgs
    .filter((name) => !isTypes(name))
    .map(dep2type);

  const installedTypes = allDepPkgs
    .filter((name) => isTypes(name))
    .sort(sorter);

  // * ---------------- analyzing dependencies

  const shouldKeepTypes = allCandidateTypes.filter((e) =>
    installedTypes.includes(e),
  );

  const missed = allCandidateTypes
    .filter((name) => !shouldKeepTypes.includes(name))
    .sort(sorter);

  const unused = installedTypes
    .filter((name) => !shouldKeepTypes.includes(name))
    .sort(sorter);

  // * ---------------- return

  return {
    installed: installedTypes,
    unused,
    missed,
  };
};
