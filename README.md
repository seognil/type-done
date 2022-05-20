# Type Done

[![npm][npm]][npm-url] [![node][node]][node-url]

[npm]: https://img.shields.io/npm/v/type-done
[npm-url]: https://npmjs.com/package/type-done
[node]: https://img.shields.io/node/v/type-done
[node-url]: https://nodejs.org

Install missing TypeScript definition packages with one click.

> You can also read this README in [English](./README.md), [简体中文](./README.zh-hans.md)

![type-done overview](https://raw.githubusercontent.com/seognil-lab/type-done/master/screenshots/type-done-overview.png)

---

This tool analyze the `package.json` file of your project, install missing TypeScript definition packages and uninstall useless ones for you.

(e.g. [@types/moment](https://www.npmjs.com/package/@types/moment) is deprecated now, because [moment](https://github.com/moment/moment) includes [its own definition files](https://github.com/moment/moment/blob/develop/moment.d.ts))

(About TypeScript definition, you can check [TypeScript Document](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html), [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) and [Type Search](https://www.typescriptlang.org/dt/search))

## Feature

**`type-done`** supports:

- `@types` checking
  - Install missing `@types` dependencies
  - Install `@types/node` **(optional)**
  - Uninstall unused definition packages
  - Uninstall deprecated packages (e.g. `@types/moment` we just mentioned before)
  - Custom and multiple paths support (see `type-done --help`)
- Package manager support
  - Auto detected by lock file type (based on [@antfu/ni](https://github.com/antfu/ni)), or specify manager with `--tool` flag
  - Support **workspaces** ([npm](https://docs.npmjs.com/cli/v7/using-npm/workspaces), [yarn](https://classic.yarnpkg.com/lang/en/docs/workspaces/) and [pnpm](https://pnpm.io/workspaces))
  - (You can also skip the package installation step using option `--skip-install`)
- Misc (speeding)
  - Use local registry setting from `npm config` for fetch (e.g. Chinese developers may using `https://registry.npmmirror.com/` instead of `https://registry.npmjs.org/`)
  - Parallel fetching

Inspired by these tools below, but enhanced and faster:

- [salimkayabasi/types-checker](https://github.com/salimkayabasi/types-checker)
- [nfour/types-installer](https://github.com/nfour/types-installer)
- [T-Specht/ts-typie](https://github.com/T-Specht/ts-typie)

## Installation

Global install:

<pre>
npm i -g <b>type-done</b>

<b>type-done</b>
</pre>

[npm](https://docs.npmjs.com/cli/v8/commands/npm) · [yarn](https://yarnpkg.com) · [pnpm](https://pnpm.io/)

### Optional

You can also create some alias in your `.bashrc` or `.zshrc` as you wish

```
alias td='type-done'

alias tdn='type-done -N'
```

## Usage

<!-- TODO update readme -->

While at your node project folder, run `type-done` through terminal

`type-done <path | glob> [options]`

### Option

| Option                 | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `-t`, `--tool [value]` | Use specific package manager (try `yarn`, `pnpm`, `npm` in order) |
| `--skip-add`           | Skip add missing @types                                           |
| `--skip-remove`        | Skip removing unuseful @types                                     |
| `--skip-sort`          | Skip sorting dependencies in package.json                         |
| `-s`, `--skip-install` | Skip run install after analyzed                                   |
| `-d`, `--dry-run`      | Analyze only                                                      |
| `-p`, `--parallel <n>` | Set maximum number of parallel fetch tasks (defaults to 10)       |

## Changelog

### Version **3.0.0**

#### Added

- Workspace support ([npm](https://docs.npmjs.com/cli/v7/using-npm/workspaces), [yarn](https://classic.yarnpkg.com/lang/en/docs/workspaces/) and [pnpm](https://pnpm.io/workspaces))
- Custom and multiple paths support

#### Changed

- Package manager auto detected by lock file type now
- Better help infomation
- `@types/node` as on option now **(Breaking Change)**

#### Fixed

- Progress logic correctness

#### Removed

- `tnpm` support (you can still using specific manager by option, e.g. `type-done -t tnpm`)
- Custom rule support

### Version **2.0.3**

#### Added

- `tnpm`, `pnpm` support
- `skip-install` option
- Custom package name rules

#### Changed

- More step options, `-only` changed to `skip-` **(Breaking Change)**

### Version **1.2.1**

#### Added

- `npm`, `yarn` support
- custom manager support
- `install-only` and `uninstall-only` step options
- Local npm registry support
- Parallel fetching

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

MIT
