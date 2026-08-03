# @zemd/react

[![Node.js](https://img.shields.io/badge/node-%3E%3D24-000?labelColor=000&color=0000ff)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-000?labelColor=000&color=0000ff)](https://pnpm.io)
[![Turborepo](https://img.shields.io/badge/turborepo-monorepo-000?labelColor=000&color=0000ff)](https://turborepo.com)

A pnpm and Turborepo monorepo for small, focused React libraries. Each library is independently versioned and published to npm under the `@zemd` scope, so consumers install only what they need.

## Packages

| Package                                       | Version                                                                                                                                                 | Description                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [`@zemd/react-modals`](packages/modals)       | [![npm](https://img.shields.io/npm/v/@zemd/react-modals?color=0000ff&label=npm&labelColor=000)](https://www.npmjs.com/package/@zemd/react-modals)       | Lightweight modal-stack management            |
| [`@zemd/react-slottable`](packages/slottable) | [![npm](https://img.shields.io/npm/v/@zemd/react-slottable?color=0000ff&label=npm&labelColor=000)](https://www.npmjs.com/package/@zemd/react-slottable) | Typed customization of nested component slots |

Both packages include TypeScript declarations and are licensed under Apache-2.0. See each package README for its installation, compatibility, and API documentation.

## Getting started

```sh
npm install --global corepack@latest
corepack enable pnpm
git clone https://github.com/zemd/react.git
cd react
pnpm install
```

## Commands

Commands run from the repository root and apply to the workspace packages that define the corresponding task.

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm build`         | Build workspace projects through Turborepo           |
| `pnpm test`          | Run package test suites                              |
| `pnpm test-coverage` | Run package test suites with V8 coverage reports     |
| `pnpm typecheck`     | Type-check package source without emitting files     |
| `pnpm format`        | Format the repository with `oxfmt`                   |
| `pnpm format-check`  | Check formatting without writing changes             |
| `pnpm lint`          | Lint and apply safe fixes with `oxlint`              |
| `pnpm lint-check`    | Run the full type-aware lint; fails on any finding   |
| `pnpm lint-publish`  | Validate publishable package metadata with `publint` |

Use a workspace filter to run a package task directly:

```sh
pnpm --filter @zemd/react-modals build
pnpm --filter @zemd/react-slottable test
```

## Security

Report vulnerabilities through the private channels described in [`SECURITY.md`](SECURITY.md). Do not open a public issue for a suspected vulnerability.

## Contributing

Issues and pull requests are welcome. Before opening a PR, please make sure that `pnpm lint-check`, `pnpm format-check`, `pnpm typecheck`, and `pnpm test` all pass.

## License

Each package declares its own license — see the table above and the `LICENSE` file inside every package directory. Unless stated otherwise, packages are released under **Apache-2.0** 😇.

## 💙 💛 Donate

[![Support Ukraine](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
