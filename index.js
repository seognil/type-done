#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var child_process = require('child_process');
var chalk = _interopDefault(require('chalk'));
var figures = _interopDefault(require('figures'));
var ora = _interopDefault(require('ora'));
var prettyMs = _interopDefault(require('pretty-ms'));
var readPkgUp = _interopDefault(require('read-pkg-up'));
var registryUrl = _interopDefault(require('registry-url'));
var args = _interopDefault(require('args'));
var commandExists = _interopDefault(require('command-exists'));
var util = require('util');
require('axios');

const tools = {
    yarn: { install: `yarn add -D`, uninstall: `yarn remove` },
    npm: { install: `npm install -D`, uninstall: `npm uninstall` },
};
const defaultTool = Object.keys(tools).find((tool) => commandExists.sync(tool));
if (defaultTool === undefined) {
    console.error("Couldn't find a supported package manager tool");
    console.error('Have you installed Node.js?');
    process.exit();
}
// * manually choosing
args.option('tool', 'Which package manager tool to use', defaultTool);
const opts = args.parse(process.argv, {
    name: 'type-done',
    mri: {},
    mainColor: 'yellow',
    subColor: 'dim',
});
const tool = opts.tool;
const toolCommand = tools[tool];

const isTypes = (dep) => /^@types\//.test(dep);
// * `ora` <=> `@types/ora`
// * `@babel/core` <=> `@types/babel__core`
const dep2type = (name) => {
    if (/@.+\/.*/.test(name)) {
        return `@types/` + name.replace('@', '').replace('/', '__');
    }
    else {
        return `@types/` + name;
    }
};

const parsePkgTypes = (pkgJson) => {
    const { dependencies: deps = {}, devDependencies: devDeps = {} } = pkgJson;
    const sorter = (a, b) => (a < b ? -1 : 1);
    // * ----------------
    // * manually add `node` for `@types/node`
    const allDepPkgs = ['node', ...Object.keys(deps), ...Object.keys(devDeps)];
    const allCandidateTypes = allDepPkgs
        .filter((name) => !isTypes(name))
        .map(dep2type);
    const installedTypes = allDepPkgs
        .filter((name) => isTypes(name))
        .sort(sorter);
    // * ---------------- analyzing dependencies
    const shouldKeepTypes = allCandidateTypes.filter((e) => installedTypes.includes(e));
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

const execAsync = util.promisify(child_process.exec);
const globalRegistry = registryUrl();
const fetchFromInfo = async (name) => {
    const { stdout } = await execAsync(`npm view ${name} name deprecated version --json`).catch(() => ({ stdout: '{}' }));
    const { version, deprecated } = JSON.parse(stdout);
    const useful = version !== undefined && !deprecated;
    return { name, useful, deprecated: Boolean(deprecated) };
};
const fetchList = async (list) => {
    // const webList = await Promise.all(list.map((name) => fetchFromWeb(name)));
    // const founds = webList.filter((e) => e.found).map((e) => e.name);
    const infoList = await Promise.all(list.map((name) => fetchFromInfo(name)));
    const deprecated = infoList.filter((e) => e.deprecated).map((e) => e.name);
    const useful = infoList.filter((e) => e.useful).map((e) => e.name);
    return { deprecated, useful };
};

const logAnalyzedList = ({ deprecated, unused, useful }) => {
    const b = (dep) => chalk.bold(dep);
    // * ---------------- log uninstall list
    deprecated
        .filter((e) => !unused.includes(e))
        .forEach((dep) => {
        console.log(chalk.red(figures.arrowLeft, `${b(dep)} is deprecated. Needs to uninstall`));
    });
    unused.forEach((dep) => {
        console.log(chalk.red(figures.arrowLeft, `${b(dep)} is unused. Needs to uninstall`));
    });
    // * ---------------- log install list
    if (useful.length) {
        useful.forEach((dep) => {
            console.log(chalk.green(figures.arrowRight, `${b(dep)} is missing. Waiting for install`));
        });
    }
    else {
        console.log(chalk.white(figures.squareSmallFilled, `Nothing new`));
    }
};

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
    console.log(`current registry set: ${globalRegistry}`);
    const spinner = ora('Fetching...').start();
    const [{ deprecated }, { useful }] = await Promise.all([
        fetchList(installed),
        fetchList(missed),
    ]);
    spinner.stop();
    // * ---------------- run uninstall and install
    logAnalyzedList({ deprecated, unused, useful });
    const { install, uninstall } = toolCommand;
    const allUn = [...new Set([...deprecated, ...unused])].join(' ');
    if (allUn.length) {
        child_process.execSync(`${uninstall} ${allUn}`, { stdio: 'inherit' });
    }
    const allIn = useful.join(' ');
    if (allIn.length) {
        child_process.execSync(`${install} ${allIn}`, { stdio: 'inherit' });
    }
    // * ---------------- completing
    const deltaTime = prettyMs(Date.now() - startTime, {
        secondsDecimalDigits: 2,
    });
    console.log(chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`));
})();
