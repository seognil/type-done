#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import figures from 'figures';
import ora from 'ora';
import prettyMs from 'pretty-ms';
import readPkgUp from 'read-pkg-up';
import registryUrl from 'registry-url';

import { argv, tools } from './parse-args';
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
  console.log(`registry: "${globalRegistry}"`);

  const spinner = ora('Fetching...').start();

  let count = 0;
  const fetchLen = installed.length + missed.length;
  const updateSpinner = (name: string) => {
    spinner.prefixText = chalk.gray(`[${++count}/${fetchLen}]`);
    spinner.text = `Checking ${name} ...`;
  };

  const [{ deprecated }, { useful }] = await Promise.all([
    fetchList(installed, updateSpinner),
    fetchList(missed, updateSpinner),
  ]);

  spinner.stop();

  // * -------------------------------- run uninstall and install

  const { i, u, dry } = argv;

  const wouldDeprecated = u ? deprecated : [];
  const wouldUnused = u ? unused : [];
  const wouldUseful = i ? useful : [];

  const doSomething = [...wouldDeprecated, ...wouldUnused, ...wouldUseful]
    .length;

  // * ---------------- log

  if (doSomething) {
    logAnalyzedList({
      deprecated: wouldDeprecated,
      unused: wouldUnused,
      useful: wouldUseful,
    });
  } else {
    console.log(chalk.white(figures.squareSmallFilled, `Nothing to do`));
  }

  // * ---------------- run or not

  if (!dry) {
    const { install, uninstall } = tools[argv.tool];

    const allUn = [...new Set([...deprecated, ...unused])].join(' ');
    if (u && allUn.length) {
      execSync(`${uninstall} ${allUn}`, { stdio: 'inherit' });
    }

    const allIn = useful.join(' ');
    if (i && allIn.length) {
      execSync(`${install} ${allIn}`, { stdio: 'inherit' });
    }
  } else {
    if (doSomething) {
      console.log(chalk.white(figures.line, `Dry run, skipping npm`));
    }
  }

  // * ---------------- completing

  const deltaTime = prettyMs(Date.now() - startTime, {
    secondsDecimalDigits: 2,
  });
  console.log(
    chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`),
  );
})();
