#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import commandExists from 'command-exists';
import figures from 'figures';
import jsonfile from 'jsonfile';
import pkgUp from 'pkg-up';
import prettyMs from 'pretty-ms';
import { checkPkgDeps } from './process/checkPkgDepsByJson';
import { fetchDepsInfo } from './process/fetchDepsInfo';
import { logAnalyzedList } from './process/logAnalyzedList';
import { argv } from './process/parseCliArgs';
import { PatchBundle, PkgJsonObj } from './process/types';
import { updatePackageJson } from './process/updatePackageJson';

// * ================================================================================

const task = async () => {
  const pkgPath = pkgUp.sync();

  if (pkgPath === null) {
    console.error('No package.json file found!');
    process.exit();
  }

  const pkgJson = jsonfile.readFileSync(pkgPath) as PkgJsonObj;

  // * ---------------- static package analyzing

  const { installedTypes, unusedTypes, missedTypes } = checkPkgDeps(pkgJson);

  // * ---------------- fetching info

  const { deprecatedTypes, usefulTypes } = await fetchDepsInfo({
    installedTypes,
    missedTypes,
  });

  // ! ---------------- all clear early quit

  const allClear =
    !deprecatedTypes.length && !unusedTypes.length && !missedTypes.length;
  if (allClear)
    return console.log(chalk.white(figures.squareSmallFilled, `Nothing to do`));

  // * ---------------- log result

  const patchBundle: PatchBundle = {
    deprecatedTypes,
    unusedTypes,
    usefulTypes,
  };

  logAnalyzedList(patchBundle);

  // ! ---------------- dry run early quit

  if (argv['dry-run']) return;

  // * ---------------- update package.json

  await updatePackageJson(pkgPath, pkgJson, patchBundle);

  // * ---------------- install

  if (argv['skip-install']) return;

  const tool = argv.tool;

  if (!commandExists.sync(tool)) {
    console.error(`Command '${tool}' not found!`);
    process.exit();
  }

  execSync(`${tool} install`, { stdio: 'inherit' });
};

// * ================================================================================

const main = async () => {
  const startTime = Date.now();

  await task();

  const deltaTime = prettyMs(Date.now() - startTime, {
    secondsDecimalDigits: 2,
  });
  console.log(
    chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`),
  );
};

main();
