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

(About TypeScript definition, you can check [TypeScript Document](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) and [definitelytyped.org](http://definitelytyped.org/))

## Feature

type-done supports:

- Uninstall deprecated packages (e.g. `@types/moment` we just mentioned before)
- Uninstall unused definition packages
- Use local setting registry from `npm config` for fetch (e.g. Chinese developers may using `https://registry.npm.taobao.org/` instead of `https://registry.npmjs.org/`)
- Parallel fetching, improve the speed
- Also check `@types/node`
- Support `yarn` or `npm`

Inspired by these tools below, I enhanced some features, it will run faster:

- [salimkayabasi/types-checker](https://github.com/salimkayabasi/types-checker)
- [nfour/types-installer](https://github.com/nfour/types-installer)
- [T-Specht/ts-typie](https://github.com/T-Specht/ts-typie)

## Installation

Global install:

- `npm -g i type-done`
- `yarn global add type-done`

## Usage

While at your node project folder, run `type-done` through terminal

`type-done [options]`

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

MIT
