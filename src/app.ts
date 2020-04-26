#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import figures from 'figures';
import ora from 'ora';
import prettyMs from 'pretty-ms';
import readPkgUp from 'read-pkg-up';
import registryUrl from 'registry-url';

import { toolCommand } from './choose-package-manager';
import { parsePkgTypes } from './pkg-json-analyze';
import { fetchList } from './pkg-fetch-info';
import { logAnalyzedList } from './end-log';

(async () => {
  const startTime = Date.now();

  // * ---------------- check if package.json exists

  const pkgData = await readPkgUp();

  if (pkgData === undefined) {
    console.error('No package.json file found!');
    process.exit();
  }

  // * ---------------- static package analyzing

  const { installed, unused, missed } = parsePkgTypes(pkgData.packageJson);

  // * ---------------- fetching

  const globalRegistry = registryUrl();
  console.log(`registry = "${globalRegistry}"`);

  const spinner = ora('Fetching...').start();

  const [{ deprecated }, { useful }] = await Promise.all([
    fetchList(installed, spinner),
    fetchList(missed, spinner),
  ]);

  spinner.stop();

  // * ---------------- run uninstall and install

  logAnalyzedList({ deprecated, unused, useful });

  const { install, uninstall } = toolCommand;

  const allUn = [...new Set([...deprecated, ...unused])].join(' ');
  if (allUn.length) {
    execSync(`${uninstall} ${allUn}`, { stdio: 'inherit' });
  }

  const allIn = useful.join(' ');
  if (allIn.length) {
    execSync(`${install} ${allIn}`, { stdio: 'inherit' });
  }

  // * ---------------- completing

  const deltaTime = prettyMs(Date.now() - startTime, {
    secondsDecimalDigits: 2,
  });
  console.log(
    chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`),
  );
})();
