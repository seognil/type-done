# Type Done

一键安装缺失的 TypeScript 类型声明库。

> 你也可以去看其他语言的 README：[English](./README.md), [简体中文](./README.zh-hans.md)

![type-done overview](https://raw.githubusercontent.com/seognil-lab/type-done/master/screenshots/type-done-overview.png)

---

本工具解析你项目中的 `package.json` 文件，为你安装缺失的类型声明库，并删除无用的声明库。

（比方说，[@types/moment](https://www.npmjs.com/package/@types/moment) 现在已经废弃，因为 [moment](https://github.com/moment/moment) 已经内置了 [声明文件](https://github.com/moment/moment/blob/develop/moment.d.ts)）

（关于类型声明，可以参考 [TypeScript 文档（社区汉化版）](https://zhongsp.gitbook.io/typescript-handbook/introduction) 和 [definitelytyped.org](http://definitelytyped.org/)）

## 特性

type-done 支持的特性：

- 删除废弃的类型声明库（比如刚才提到的 `@types/moment`）
- 删除未使用的类型声明库
- 通过读取 `npm config` 解析你当前设置的仓库源（比如国内用户可能用的是 `https://registry.npm.taobao.org/` 而不是 `https://registry.npmjs.org/`）
- 并行搜索，提升网络性能
- 顺便检查 `@types/node`
- 支持 `yarn` 或 `npm` 进行处理

本工具灵感来自以下工具，我调整了一些逻辑，运行效率更高：

- [salimkayabasi/types-checker](https://github.com/salimkayabasi/types-checker)
- [nfour/types-installer](https://github.com/nfour/types-installer)
- [T-Specht/ts-typie](https://github.com/T-Specht/ts-typie)

## 安装

全局安装：

- `npm -g i type-done`
- `yarn global add type-done`

或作为依赖安装：

- `npm install -D type-done`
- `yarn add -D type-done`

## 使用

进入你的 Node 项目文件夹中，然后在终端运行 `type-done` 命令

如果是通过全局安装的：

`type-done [options]`

如果是作为依赖安装的：

`npx type-done [options]`

也可以加入到 `package.json` 的 `scripts` 字段中，通过钩子实现自动安装。

```json
{
  "scripts": {
    "postinstall": "type-done"
  }
}
```

### 选项

| 选项                           | 描述                                     |
| ------------------------------ | ---------------------------------------- |
| `-t [value]`, `--tool [value]` | 指定包管理器 (默认按顺序尝试 yarn , npm) |
| `-d`, `--dry-run`              | 空运行，只进行分析，不进行安装或卸载     |
| `-i`, `--install`              | 只进行安装，不进行卸载                   |
| `-u`, `--uninstall`            | 只进行卸载，不进行安装                   |

## 贡献

欢迎提 PR。如果是大的改动，那你可以先开一个 issue 来讨论你想进行什么改动。

调整后记得同时更新测试。

## License

MIT
