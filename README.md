# Zhi

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

## Understand this workspace

Run `nx graph` to see a diagram of the dependencies of the projects.

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Init new project

```bash
## project
npx create-nx-workspace zhi --package-manager=pnpm --preset=ts 

## library
nx generate @nrwl/js:library zhi-env --publishable --importPath zhi-env
nx generate @nrwl/node:library mylibrary

## app
nx generate @nrwl/web:app myapp
nx generate @nrwl/node:app myapp
```

## Setup

```
pnpm install
```

## Build

```
nx build zhi-env
nx run-many --target=build
nx affected --target=build
```

## Lint

```
nx lint zhi-env
```

## Test

```
nx test zhi-env
```

## Publish

```
nx publish zhi-env
```

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
