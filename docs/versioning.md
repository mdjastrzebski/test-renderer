# Versioning

This document defines the versioning policy for `test-renderer` (TR) starting with `1.x`.

## Goals

- Prevent peer dependency errors or warnings for incompatible React versions.
- Let consumers adopt new React features as soon as their React version supports them.
- Let a consumer package such as a testing library depend on `test-renderer` without forcing all users onto the newest React 19 minor.
- Avoid vendoring `react-reconciler` unless it becomes necessary.

## Constraints

`test-renderer` depends on a single `react-reconciler` (RR) version line at a time.

Because `react-reconciler` has a React peer dependency, one published `test-renderer` package can only cleanly support a bounded range of React versions. Without vendoring `react-reconciler` or shipping separate package names, supporting every React 19 minor from a single `test-renderer@latest` release would require one of two bad options:

- allowing incorrect installs, or
- weakening peer dependency ranges so much that package managers stop protecting users from incompatible combinations.

## Policy

For `test-renderer` 1.x, the version number has two meanings:

- `major` tracks TR API or behavior breaks, or a move to a new React major.
- `minor` tracks the supported React 19 compatibility line.
- `patch` tracks fixes and features that stay within the same compatibility line.

In practice, this means each `1.x` minor corresponds to a specific React / RR line.

## Compatibility Lines

### `1.0.x`

- `react-reconciler`: `~0.31.0`
- `peerDependencies.react`: `>=19.0.0 <19.1.0`

### `1.1.x`

- `react-reconciler`: `~0.32.0`
- `peerDependencies.react`: `>=19.1.0 <19.2.0`

### `1.2.x`

- `react-reconciler`: `~0.33.0`
- `peerDependencies.react`: `>=19.2.0 <19.3.0`

## Release Rules

### Patch releases

Use patch releases for:

- bug fixes within the current React compatibility line
- internal improvements that do not raise the minimum supported React minor
- new TR features that work on the existing RR line

Example:

- `1.1.2` -> `1.1.3` for a bug fix that still supports React `19.1.x`

### Minor releases

Use minor releases for:

- adopting a newer `react-reconciler` line
- raising the minimum supported React 19 minor
- introducing features that require the newer React / RR line

Examples:

- `1.0.x` -> `1.1.x` when moving from RR `0.31` to `0.32`
- `1.1.x` -> `1.2.x` when moving from RR `0.32` to `0.33`

Minor releases may be incompatible for consumers on older React minors. This is intentional. The peer dependency range should make that incompatibility explicit at install time.

### Major releases

Use major releases for:

- TR API or behavior changes that break existing consumers across compatibility lines
- a move from React `19` support to React `20`

## Backporting

If a new TR feature or bug fix does not depend on a newer React / RR line, it should be backported to every maintained compatibility line.

Examples:

- a fix that works everywhere may ship as `1.0.5`, `1.1.4`, and `1.2.1`
- a feature that requires React `19.2` should ship only in `1.2.x`

This lets users on older React minor versions keep using the latest compatible consumer package without peer dependency issues, as long as that package does not require a newer `test-renderer` line.

## Peer Dependency Guidance

`test-renderer` should use bounded React peer ranges per compatibility line.

Recommended ranges:

- `1.0.x`: `>=19.0.0 <19.1.0`
- `1.1.x`: `>=19.1.0 <19.2.0`
- `1.2.x`: `>=19.2.0 <19.3.0`

Avoid using a broad range such as `^19.0.0` for every line. Doing so would let users install a `test-renderer` version backed by an older `react-reconciler` line with a newer React version than that line was designed for.

## Consumer Package Strategy

A consumer package such as a testing library should depend on `test-renderer` as a regular dependency, not a peer dependency.

Recommended range:

```json
{
  "dependencies": {
    "test-renderer": "^1.0.0 || ^1.1.0 || ^1.2.0"
  }
}
```

This lets package managers choose the highest compatible `test-renderer` line based on the app's installed React version.

To make this work well, the consumer package should either:

- rely only on TR APIs available across all supported `1.x` compatibility lines, or
- use feature detection when integrating with newer TR capabilities

## Dist Tags

For direct `test-renderer` consumers, publish dist tags for each compatibility line:

- `latest` -> newest supported line, typically the highest React 19 line
- `react19.0` -> latest `1.0.x`
- `react19.1` -> latest `1.1.x`
- `react19.2` -> latest `1.2.x`

This keeps `npm` install flows predictable for users who consume `test-renderer` directly.

## Summary

The recommended `test-renderer` 1.x scheme is:

- `1.0.x` for React `19.0`
- `1.1.x` for React `19.1`
- `1.2.x` for React `19.2`

With this scheme:

- install-time peer dependency checks remain useful
- a consumer package can stay compatible with multiple React 19 lines
- new React features can be exposed as soon as a new compatibility line is published
- vendoring `react-reconciler` is not required
