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

Both packages are ESM-only, include TypeScript declarations, and are licensed under Apache-2.0. See each package README for its installation, compatibility, and API documentation.

## Getting started

```sh
npm install --global corepack@latest
corepack enable pnpm
git clone https://github.com/zemd/react.git
cd react
pnpm install
```

### Dev Container

The checked-in [Dev Container configuration](.devcontainer/devcontainer.json) provides the repository's pinned Node.js, pnpm, and zizmor versions. In VS Code, run **Dev Containers: Reopen in Container**. The first container creation installs the frozen workspace dependencies.

## Commands

Commands run from the repository root and apply to the workspace packages that define the corresponding task.

| Command                      | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `pnpm build`                 | Build workspace projects through Turborepo           |
| `pnpm test`                  | Run package test suites                              |
| `pnpm test-coverage`         | Run package test suites with V8 coverage reports     |
| `pnpm typecheck`             | Type-check package source without emitting files     |
| `pnpm format`                | Format the repository with `oxfmt`                   |
| `pnpm format-check`          | Check formatting without writing changes             |
| `pnpm lint-fix`              | Run type-aware linting and auto-fix with `oxlint`    |
| `pnpm lint-check`            | Run type-aware linting and fail on warnings          |
| `pnpm lint-publish`          | Validate publishable package metadata with `publint` |
| `pnpm pre-commit`            | Format, lint-fix, validate, and stage all files      |
| `pnpm pre-push`              | Run the complete local pre-push validation graph     |
| `pnpm run git-hooks-install` | Install this checkout's native Git hooks             |

Use a workspace filter to run a package task directly:

```sh
pnpm --filter @zemd/react-modals build
pnpm --filter @zemd/react-slottable test
```

## Security

Report vulnerabilities through the private channels described in [`SECURITY.md`](SECURITY.md). Do not open a public issue for a suspected vulnerability.

## Contributing

Issues and pull requests are welcome. Native hooks install automatically during `pnpm install`. The pre-commit hook runs repository-wide lint fixes and formatting, runs optional workspace `pre-commit` scripts, then stages all resulting changes. The pre-push hook runs builds, type checks, publication metadata checks, tests, and package `pre-push` tasks.

Before opening a PR, please make sure that `pnpm lint-check`, `pnpm format-check`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm lint-publish` all pass.

## License

Each package declares its own license — see the table above and the `LICENSE` file inside every package directory. Unless stated otherwise, packages are released under **Apache-2.0** 😇.

## 💙 💛 Donate

[![Support Ukraine](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
