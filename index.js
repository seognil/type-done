#!/usr/bin/env node
import chalk from 'chalk';
import { execSync } from 'child_process';
import commandExists from 'command-exists';
import figures from 'figures';
import jsonfile from 'jsonfile';
import pkgUp from 'pkg-up';
import prettyMs from 'pretty-ms';
import ora from 'ora';
import registryUrl from 'registry-url';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import yargs from 'yargs';
import sortKeys from 'sort-keys';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
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

const customRules = {
    webpack: ['webpack-env'],
};

const isTypes = (dep) => /^@types\//.test(dep);
// * `ora` <=> `@types/ora`
// * `@babel/core` <=> `@types/babel__core`
const depName2typeName = (name) => {
    if (/@.+\/.*/.test(name)) {
        return `@types/` + name.replace('@', '').replace('/', '__');
    }
    else {
        return `@types/` + name;
    }
};

const checkPkgDeps = (pkgJson) => {
    const { dependencies: deps = {}, devDependencies: devDeps = {} } = pkgJson;
    const sorter = (a, b) => (a < b ? -1 : 1);
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
    const skippingTypes = allTypesToCheck.filter((e) => installedTypes.includes(e));
    const missedTypes = allTypesToCheck
        .filter((name) => !skippingTypes.includes(name))
        .sort(sorter);
    const unusedTypes = installedTypes
        .filter((name) => !skippingTypes.includes(name))
        .sort(sorter);
    // * ---------------- return
    return { installedTypes, missedTypes, unusedTypes };
};

var _a;
// * ----------------------------------------------------------------
const NPM_MANAGER_LIST = ['yarn', 'tnpm', 'pnpm', 'npm'];
const DEFAULT_MANAGER = (_a = NPM_MANAGER_LIST.find((tool) => commandExists.sync(tool))) !== null && _a !== void 0 ? _a : 'npm';
const DEFAULT_PARALLEL = 10;
// * ----------------------------------------------------------------
const argv = yargs(process.argv.slice(2))
    .options({
    'tool': {
        alias: 't',
        describe: 'Which package manager to use',
        default: DEFAULT_MANAGER,
        type: 'string',
    },
    'skip-add': {
        describe: 'Skip add missing @types',
        default: false,
        type: 'boolean',
    },
    'skip-remove': {
        describe: 'Skip removing unuseful @types',
        default: false,
        type: 'boolean',
    },
    'skip-sort': {
        describe: 'Skip sorting dependencies',
        default: false,
        type: 'boolean',
    },
    'skip-install': {
        alias: 's',
        describe: 'Skip run install after analyzed',
        default: false,
        type: 'boolean',
    },
    'dry-run': {
        alias: 'd',
        describe: 'Analyze only',
        default: false,
        type: 'boolean',
    },
    'parallel': {
        alias: 'p',
        describe: 'Set maximum number of parallel fetch tasks',
        default: DEFAULT_PARALLEL,
        type: 'number',
    },
})
    .parseSync();

// * default is: https://registry.npmjs.org/
const globalRegistry = registryUrl();
const limit = pLimit(argv.parallel);
// * ----------------
const fetchSingle = (pkgName, tick) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const url = `${globalRegistry}/${pkgName}`.replace(/(?<!:)\/\//, '/');
    const res = (yield fetch(url)
        .then((e) => e.json())
        .catch(() => {
        'Not found';
        tick === null || tick === void 0 ? void 0 : tick(pkgName);
    }));
    const lastVer = (_a = res === null || res === void 0 ? void 0 : res['dist-tags']) === null || _a === void 0 ? void 0 : _a.latest;
    const isDeprecated = ((_c = (_b = res === null || res === void 0 ? void 0 : res.versions) === null || _b === void 0 ? void 0 : _b[lastVer]) === null || _c === void 0 ? void 0 : _c.deprecated) !== undefined;
    const isUseful = lastVer !== undefined && !isDeprecated;
    tick === null || tick === void 0 ? void 0 : tick(pkgName);
    return { pkgName, lastVer, isUseful, isDeprecated };
});
// * ----------------
const fetchList = (depslist, tick) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield Promise.all(depslist.map((name) => limit(() => fetchSingle(name, tick))));
    const deprecatedTypes = results.filter((e) => e.isDeprecated);
    const usefulTypes = results.filter((e) => e.isUseful);
    return { deprecatedTypes, usefulTypes };
});

const fetchDepsInfo = ({ installedTypes, missedTypes, }) => __awaiter(void 0, void 0, void 0, function* () {
    const globalRegistry = registryUrl();
    console.log(`registry: "${globalRegistry}"`);
    const spinner = ora('Fetching...').start();
    let count = 0;
    const fetchLen = installedTypes.length + missedTypes.length;
    const updateSpinner = (depName) => {
        spinner.prefixText = chalk.gray(`[${++count}/${fetchLen}]`);
        spinner.text = `Checking ${depName} ...`;
    };
    const [{ deprecatedTypes }, { usefulTypes }] = yield Promise.all([
        fetchList(installedTypes, updateSpinner),
        fetchList(missedTypes, updateSpinner),
    ]);
    spinner.stop();
    return { deprecatedTypes, usefulTypes };
});

const b = (dep) => chalk.bold(dep);
const logAnalyzedList = ({ deprecatedTypes, unusedTypes, usefulTypes, }) => {
    const deprecatedNames = deprecatedTypes.map((e) => e.pkgName);
    const unusedNames = unusedTypes;
    const usefulNames = usefulTypes.map((e) => e.pkgName);
    // * ---------------- log uninstall list
    deprecatedNames
        .filter((e) => !unusedNames.includes(e))
        .forEach((dep) => {
        console.log(chalk.red(figures.arrowLeft, `${b(dep)} is deprecated. Needs to uninstall`));
    });
    unusedNames.forEach((dep) => {
        console.log(chalk.red(figures.arrowLeft, `${b(dep)} is unused. Needs to uninstall`));
    });
    // * ---------------- log install list
    usefulNames.forEach((dep) => {
        console.log(chalk.green(figures.arrowRight, `${b(dep)} is missing. Waiting for install`));
    });
};

const updatePackageJson = (pkgPath, pkgJson, { deprecatedTypes, unusedTypes, usefulTypes }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!argv['skip-add']) {
        usefulTypes.forEach((e) => {
            pkgJson.devDependencies[e.pkgName] = `^${e.lastVer}`;
        });
    }
    if (!argv['skip-remove']) {
        deprecatedTypes.forEach((e) => {
            delete pkgJson.dependencies[e.pkgName];
            delete pkgJson.devDependencies[e.pkgName];
        });
        unusedTypes.forEach((e) => {
            delete pkgJson.dependencies[e];
            delete pkgJson.devDependencies[e];
        });
    }
    if (!argv['skip-sort']) {
        Object.keys(pkgJson.dependencies).forEach((e) => {
            if (isTypes(e)) {
                pkgJson.devDependencies[e] = pkgJson.dependencies[e];
                delete pkgJson.dependencies[e];
            }
        });
        pkgJson.dependencies = sortKeys(pkgJson.dependencies);
        pkgJson.devDependencies = sortKeys(pkgJson.devDependencies);
    }
    yield jsonfile.writeFile(pkgPath, pkgJson, { spaces: 2 });
});

// * ================================================================================
const task = () => __awaiter(void 0, void 0, void 0, function* () {
    // * ---------------- check if package.json exists
    const pkgPath = yield pkgUp();
    if (pkgPath === null) {
        console.error('No package.json file found!');
        process.exit();
    }
    const pkgJson = yield jsonfile.readFile(pkgPath);
    // * ---------------- static package analyzing
    const { installedTypes, unusedTypes, missedTypes } = checkPkgDeps(pkgJson);
    // * ---------------- fetching info
    const { deprecatedTypes, usefulTypes } = yield fetchDepsInfo({
        installedTypes,
        missedTypes,
    });
    // ! ---------------- all clear early quit
    const allClear = !deprecatedTypes.length && !unusedTypes.length && !missedTypes.length;
    if (allClear)
        return console.log(chalk.white(figures.squareSmallFilled, `Nothing to do`));
    // * ---------------- log result
    const patchBundle = {
        deprecatedTypes,
        unusedTypes,
        usefulTypes,
    };
    logAnalyzedList(patchBundle);
    // ! ---------------- dry run early quit
    if (argv['dry-run'])
        return;
    // * ---------------- update package.json
    yield updatePackageJson(pkgPath, pkgJson, patchBundle);
    // * ---------------- install
    if (argv['skip-install'])
        return;
    const tool = argv.tool;
    if (!commandExists.sync(tool)) {
        console.error(`Command '${tool}' not found!`);
        process.exit();
    }
    execSync(`${tool} install`, { stdio: 'inherit' });
});
// * ================================================================================
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    yield task();
    const deltaTime = prettyMs(Date.now() - startTime, {
        secondsDecimalDigits: 2,
    });
    console.log(chalk.green(figures.tick, `All types are OK. Done in ${deltaTime}`));
});
main();
