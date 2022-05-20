#!/usr/bin/env node

import chalk from 'chalk';
import figures from 'figures';
import prettyMs from 'pretty-ms';
import { cliStartCheck } from './steps/0.startCheck';
import { searchProjectsWithLog } from './steps/1.searchProjects';

// * ================================================================================

const task = async () => {
  cliStartCheck();

  const searchResult = await searchProjectsWithLog();
};

// * ================================================================================

const main = async () => {
  const startTime = Date.now();

  await task();

  const deltaTime = prettyMs(Date.now() - startTime, {
    secondsDecimalDigits: 2,
  });
  console.log(chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`));
};

main();
