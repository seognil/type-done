import { customRules } from '../customRules';
import { depName2typeName, isTypes } from './nameMapper';
import { PkgJsonObj } from './types';

interface CheckResult {
  installedTypes: string[];
  unusedTypes: string[];
  missedTypes: string[];
}

export const checkPkgDeps = (pkgJson: PkgJsonObj): CheckResult => {
  const { dependencies: deps = {}, devDependencies: devDeps = {} } = pkgJson;

  const sorter = (a: string, b: string) => (a < b ? -1 : 1);

  // * ----------------

  // * manually add `node` for `@types/node`
  const allJsonDeps = ['node', ...Object.keys(deps), ...Object.keys(devDeps)];

  /** search customRules with current package.json deps */
  const allAddonDeps = allJsonDeps
    .flatMap((e) => customRules[e])
    .filter((e) => e);

  const allDeps = [...allJsonDeps, ...allAddonDeps];

  const allTypesToCheck = allDeps
    .filter((name) => !isTypes(name))
    .map(depName2typeName);

  const installedTypes = allDeps.filter((name) => isTypes(name)).sort(sorter);

  // * ---------------- analyzing dependencies

  const skippingTypes = allTypesToCheck.filter((e) =>
    installedTypes.includes(e),
  );

  const missedTypes = allTypesToCheck
    .filter((name) => !skippingTypes.includes(name))
    .sort(sorter);

  const unusedTypes = installedTypes
    .filter((name) => !skippingTypes.includes(name))
    .sort(sorter);

  // * ---------------- return

  return { installedTypes, missedTypes, unusedTypes };
};
