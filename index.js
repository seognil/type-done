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
var fetch = _interopDefault(require('node-fetch'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// * ----------------------------------------------------------------
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
// * ----------------------------------------------------------------
args.option('tool', 'Which manager to use', defaultTool);
args.option('install-only', 'Skip uninstall step');
args.option('uninstall-only', 'Skip install step');
args.option('dry-run', 'Only do analyze, skip run npm');
const res = args.parse(process.argv, {
    name: 'type-done',
    mri: {},
    mainColor: 'bold',
    subColor: 'dim',
});
const { i, u } = res;
const argv = {
    tool: res.tool,
    i: !(u && !i),
    u: !(i && !u),
    dry: res.d === true,
};

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

const patch = {
    webpack: ['webpack-env'],
};

const parsePkgTypes = (pkgJson) => {
    const { dependencies: deps = {}, devDependencies: devDeps = {} } = pkgJson;
    const sorter = (a, b) => (a < b ? -1 : 1);
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

// * default is: https://registry.npmjs.org/
const globalRegistry = registryUrl();
// * ----------------
const fetchSingle = (name, cb) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const url = `${globalRegistry}/${name}`.replace(/(?<!:)\/\//, '/');
    const res = yield fetch(url)
        .then((e) => e.json())
        .catch(() => ({ error: 'Not found' }));
    const latestVer = (_a = res === null || res === void 0 ? void 0 : res['dist-tags']) === null || _a === void 0 ? void 0 : _a.latest;
    const deprecated = ((_c = (_b = res === null || res === void 0 ? void 0 : res.versions) === null || _b === void 0 ? void 0 : _b[latestVer]) === null || _c === void 0 ? void 0 : _c.deprecated) !== undefined;
    const useful = (res === null || res === void 0 ? void 0 : res.versions) !== undefined && !deprecated;
    cb === null || cb === void 0 ? void 0 : cb(name);
    return { name, useful, deprecated };
});
// * ----------------
const fetchList = (list, cb) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield Promise.all(list.map((name) => fetchSingle(name, cb)));
    const deprecated = results.filter((e) => e.deprecated).map((e) => e.name);
    const useful = results.filter((e) => e.useful).map((e) => e.name);
    return { deprecated, useful };
});

const b = (dep) => chalk.bold(dep);
const logAnalyzedList = ({ deprecated, unused, useful }) => {
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
    useful.forEach((dep) => {
        console.log(chalk.green(figures.arrowRight, `${b(dep)} is missing. Waiting for install`));
    });
};

(() => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    // * ---------------- check if package.json exists
    const pkgData = yield readPkgUp();
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
    const updateSpinner = (name) => {
        spinner.prefixText = chalk.gray(`[${++count}/${fetchLen}]`);
        spinner.text = `Checking ${name} ...`;
    };
    const [{ deprecated }, { useful }] = yield Promise.all([
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
    }
    else {
        console.log(chalk.white(figures.squareSmallFilled, `Nothing to do`));
    }
    // * ---------------- run or not
    if (!dry) {
        const { install, uninstall } = tools[argv.tool];
        const allUn = [...new Set([...deprecated, ...unused])].join(' ');
        if (u && allUn.length) {
            child_process.execSync(`${uninstall} ${allUn}`, { stdio: 'inherit' });
        }
        const allIn = useful.join(' ');
        if (i && allIn.length) {
            child_process.execSync(`${install} ${allIn}`, { stdio: 'inherit' });
        }
    }
    else {
        if (doSomething) {
            console.log(chalk.white(figures.line, `Dry run, skipping npm`));
        }
    }
    // * ---------------- completing
    const deltaTime = prettyMs(Date.now() - startTime, {
        secondsDecimalDigits: 2,
    });
    console.log(chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`));
}))();
