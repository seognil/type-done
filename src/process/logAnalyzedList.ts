import chalk from 'chalk';
import figures from 'figures';
import { PatchBundle } from './types';

const b = (dep: string) => chalk.bold(dep);

export const logAnalyzedList = ({
  deprecatedTypes,
  unusedTypes,
  usefulTypes,
}: PatchBundle) => {
  const deprecatedNames = deprecatedTypes.map((e) => e.pkgName);
  const unusedNames = unusedTypes;
  const usefulNames = usefulTypes.map((e) => e.pkgName);

  // * ---------------- log uninstall list

  deprecatedNames
    .filter((e) => !unusedNames.includes(e))
    .forEach((dep) => {
      console.log(
        chalk.red(
          figures.arrowLeft,
          `${b(dep)} is deprecated. Needs to uninstall`,
        ),
      );
    });

  unusedNames.forEach((dep) => {
    console.log(
      chalk.red(figures.arrowLeft, `${b(dep)} is unused. Needs to uninstall`),
    );
  });

  // * ---------------- log install list

  usefulNames.forEach((dep) => {
    console.log(
      chalk.green(
        figures.arrowRight,
        `${b(dep)} is missing. Waiting for install`,
      ),
    );
  });
};
