# Versioning

This document defines the versioning policy for `test-renderer` (TR) starting with `1.x`.

## Goals

- Avoid leaving users without an installable `test-renderer` release when React publishes a new 19.x minor before the matching preferred TR line is ready.
- Let consumers adopt new React features as soon as their React version supports them.
- Let a consumer package such as a testing library depend on `test-renderer` without forcing all users onto the newest React 19 minor.
- Avoid vendoring `react-reconciler` unless it becomes necessary.

## Constraints

`test-renderer` depends on a single `react-reconciler` (RR) version line at a time.

Because `react-reconciler` is versioned alongside React internals, each `test-renderer` minor still has a preferred React / RR line even when the package publishes a broad React 19 peer range.

In practice, older `test-renderer` lines may continue to work on newer React 19 minors for many use cases, but they should not be assumed to support newer-minor-specific features until the matching TR line exists.

## Policy

For `test-renderer` 1.x, the version number has two meanings:

- `major` tracks TR API or behavior breaks, or a move to a new React major.
- `minor` tracks the preferred React 19 compatibility line and bundled `react-reconciler` line.
- `patch` tracks fixes and features that stay within the same preferred line.

In practice, each `1.x` minor corresponds to a specific React / RR line, while `peerDependencies.react` stays broad enough to avoid blocking installs across React 19 minors.

## Compatibility Lines

### `1.0.x`

- `react-reconciler`: `~0.31.0`
- preferred React line: `19.0`
- `peerDependencies.react`: `^19.0.0`

### `1.1.x`

- `react-reconciler`: `~0.32.0`
- preferred React line: `19.1`
- `peerDependencies.react`: `^19.0.0`

### `1.2.x`

- `react-reconciler`: `~0.33.0`
- preferred React line: `19.2`
- `peerDependencies.react`: `^19.0.0`

## Release Rules

### Patch releases

Use patch releases for:

- bug fixes within the current preferred React compatibility line
- internal improvements that do not raise the minimum supported React minor
- new TR features that work on the existing RR line

Example:

- `1.1.2` -> `1.1.3` for a bug fix that still supports React `19.1.x`

### Minor releases

Use minor releases for:

- adopting a newer `react-reconciler` line
- advancing the preferred React 19 minor line
- introducing features that require the newer React / RR line

Examples:

- `1.0.x` -> `1.1.x` when moving from RR `0.31` to `0.32`
- `1.1.x` -> `1.2.x` when moving from RR `0.32` to `0.33`

Minor releases are where React-minor-specific features become officially supported. Older lines may still install and work on newer React minors, but the newer line is the preferred target once it exists.

### Major releases

Use major releases for:

- TR API or behavior changes that break existing consumers across compatibility lines
- a move from React `19` support to React `20`

## Backporting

If a new TR feature or bug fix does not depend on a newer React / RR line, it should be backported to every maintained compatibility line.

Examples:

- a fix that works everywhere may ship as `1.0.5`, `1.1.4`, and `1.2.1`
- a feature that requires React `19.2` should ship only in `1.2.x`

This lets users on older preferred lines keep receiving fixes without waiting for newer React-specific work.

## Peer Dependency Guidance

`test-renderer` should use a broad React 19 peer range across active `1.x` lines.

Recommended range:

- `1.x`: `^19.0.0`

This keeps installs working across React 19 minors even when the matching preferred TR line has not shipped yet.

Broad peers are not a promise that every `1.x` line fully supports every newer React 19 minor feature. The preferred React / RR line for each minor release remains the authoritative signal for where new React-minor-specific support lands.

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

This keeps the consumer package open to newer `test-renderer` lines without turning `test-renderer` into another peer dependency.

To make this work well, the consumer package should either:

- rely only on TR APIs available across all supported `1.x` preferred lines, or
- use feature detection when integrating with newer TR capabilities

## Dist Tags

When multiple `1.x` compatibility lines are live, direct `test-renderer` consumers should get line-specific dist tags:

- `latest` -> newest supported line, typically the highest React 19 line
- `react19.0` -> latest `1.0.x`
- `react19.1` -> latest `1.1.x`
- `react19.2` -> latest `1.2.x`

This keeps `npm` install flows predictable for users who consume `test-renderer` directly.

During the initial rollout, `latest` may temporarily point at `1.0.x` before higher React 19 compatibility lines are published. Dist tags become more useful once there is more than one active `1.x` line.

## Summary

The recommended `test-renderer` 1.x scheme is:

- `1.0.x` for React `19.0`
- `1.1.x` for React `19.1`
- `1.2.x` for React `19.2`

With this scheme:

- installs remain unblocked across React 19 minors
- a consumer package can stay compatible with multiple React 19 lines
- new React features can be exposed as soon as a new compatibility line is published
- vendoring `react-reconciler` is not required
