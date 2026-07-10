# Testing Async Code with `act`

When a component updates state asynchronously (after a network call, a `setTimeout`, or a promise), you need to let those updates settle **inside `act()`** before asserting. This guide shows the recommended patterns and the pitfalls to avoid.

## The golden rule

Wrap every update in an `act()` call that you **`await`**, and keep each `act()` scope small:

```tsx
await act(async () => {
  // trigger and let updates resolve
});
// assert here, after act has settled
```

An `act()` scope that is never awaited stays open. Because React tracks act scopes globally, a leaked scope can silently swallow updates from **later** renders and effects in the same test file. A common sign of this is a test that renders nothing while earlier tests in the file pass. To avoid it, always `await`, and always assert *after* the `act` closes.

## Resolving a mocked network call

The cleanest approach controls resolution explicitly with a deferred promise, so there is no timing to guess:

```tsx
import { createRoot } from "test-renderer";
import { act } from "react";

test("shows the user after fetch resolves", async () => {
  let resolve!: (user: { name: string }) => void;
  const fetchUser = jest.fn(() => new Promise((r) => { resolve = r; }));

  const renderer = createRoot();
  await act(async () => {
    renderer.render(<Profile fetchUser={fetchUser} />);
  });
  // loading state is visible here

  await act(async () => {
    resolve({ name: "Ada" }); // you decide exactly when
  });
  // resolved state is visible here
});
```

Keep `act` out of the mock itself. The mock should emulate the real dependency (which has no `act`), and the `act` belongs in the test, at the point you let the update happen.

## Fake timers

With `jest.useFakeTimers()`, advance the clock **inside** an async `act`. Prefer flushing all pending timers over advancing by a hand-picked number:

```tsx
test("fires the timeout", async () => {
  jest.useFakeTimers();

  const renderer = createRoot();
  await act(async () => {
    renderer.render(<DelayedMessage />);
  });

  await act(async () => {
    await jest.runAllTimersAsync(); // fires timers *and* flushes microtasks
    // or: await jest.runOnlyPendingTimersAsync();
  });
  // message is visible here

  jest.useRealTimers();
});
```

Use the `*Async` timer helpers, which interleave the microtask turns promise chains depend on (the synchronous variants don't):

- `jest.runAllTimersAsync()`: run every timer, including ones they schedule (loops forever on recurring timers).
- `jest.runOnlyPendingTimersAsync()`: run only the currently-queued timers; safe with recurring timers.
- `jest.advanceTimersByTimeAsync(ms)`: advance by a fixed duration.

## Real timers with `sleep`

If your mock delays with a real `sleep(ms)`, keep the act scope open across the delay:

```tsx
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await act(async () => {
  await sleep(delay); // real time passes; promise chain settles on close
});
```

> Avoid picking a "magic" wait value that must exceed the mock's internal delay, because that couples your test to the mock's timing. Prefer a deferred promise or fake timers instead.

## Flushing pending work

An empty, awaited `act` is a convenient flush point for already-scheduled microtasks and effects:

```tsx
await act(async () => {});
```

## Do & Don't

✅ **Do**

- `await` every `act()` call.
- Use `act(async () => …)` (async form) whenever a promise or microtask is involved.
- Keep each `act` scope small and assert **after** it closes.
- Drive fake timers with the `*Async` helpers, inside `act`.

❌ **Don't**

- Fire-and-forget an `act(async () => …)` without awaiting it. This leaks the scope.
- Put `act()` inside a mock, a component, or a timer patch. It is a test-only boundary.
- Wrap an entire test in one large `act`. Prefer several small, scoped ones.
- Match a real `sleep` wait to the mock's internal delay. Remove the timing dependency instead.
