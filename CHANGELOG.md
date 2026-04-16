# Changelog

All notable changes to `test-renderer` are documented in this file.

## [1.2.0](https://github.com/mdjastrzebski/test-renderer/compare/v1.1.0...v1.2.0) (2026-04-16)

### Features

- React 19.2 support ([#52](https://github.com/mdjastrzebski/test-renderer/issues/52)) ([17874e2](https://github.com/mdjastrzebski/test-renderer/commit/17874e2ca312d50534013537eac3114a4fb8b1ee))
- `1.2.x` is now the preferred compatibility line for React `19.2`
- Updated bundled `react-reconciler` to `~0.33.0`
- Added support coverage for React 19.2 features relevant to `test-renderer`, including `<Activity>` and `useEffectEvent`

## [1.1.0](https://github.com/mdjastrzebski/test-renderer/compare/v1.0.0...v1.1.0) (2026-04-16)

### Features

- React 19.1 support ([#51](https://github.com/mdjastrzebski/test-renderer/issues/51)) ([14a1726](https://github.com/mdjastrzebski/test-renderer/commit/14a172635326f8601eb9629a60e6374d514a340f))
- `1.1.x` is now the preferred compatibility line for React `19.1`
- Updated bundled `react-reconciler` to `~0.32.0`
- Covers React 19.1 additions relevant to `test-renderer`, including Owner Stack support and the CSS-selector-safe `useId()` format

## [1.0.0](https://github.com/mdjastrzebski/test-renderer/compare/v0.16.0...v1.0.0) (2026-04-16)

### Features

- Stable `1.x` release line for `test-renderer`
- Established the React 19 compatibility-line versioning model for `1.x`
- Added versioning documentation in [`docs/versioning.md`](./docs/versioning.md)

### Breaking Changes

- Removed the deprecated `HostElement` alias
  Migration: replace `HostElement` with `TestInstance`

### API Contract Updates

- `Root.render` remains `ReactElement`-only
- Fragments are supported because they are React elements
- Non-element root values like `null` or bare strings are not supported
- Unsupported root values now fail with a deliberate error instead of an incidental crash path

## Earlier Releases

For `0.x` release history, see the repository tags:

- [v0.16.0](https://github.com/mdjastrzebski/test-renderer/releases/tag/v0.16.0)
- [v0.15.0](https://github.com/mdjastrzebski/test-renderer/releases/tag/v0.15.0)
- [v0.14.0](https://github.com/mdjastrzebski/test-renderer/releases/tag/v0.14.0)
- and earlier tags in the [releases list](https://github.com/mdjastrzebski/test-renderer/tags)
