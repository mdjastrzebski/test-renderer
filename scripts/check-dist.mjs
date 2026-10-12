// Loads the built package through its `exports` map with plain Node, outside Jest and bundlers,
// to catch output that only resolves in tooling (e.g. extensionless subpath imports in ESM).
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// `require` is not available in ES modules, so create one for the CJS entry.
const require = createRequire(import.meta.url);
const React = require("react");

// Tells React that `act()` is supported here, silencing its "not configured" warning.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Self-referencing the package by name resolves `import` → dist/index.js and `require` → dist/index.cjs.
const entries = {
  esm: await import("test-renderer"),
  cjs: require("test-renderer"),
};

for (const [format, { createRoot }] of Object.entries(entries)) {
  const root = createRoot();
  await React.act(async () => {
    root.render(React.createElement("div", { id: "root" }, "Hello"));
  });

  // Pick fields explicitly: `toJSON()` output also carries a `$$typeof` symbol key.
  const { type, props, children } = root.container.children[0].toJSON();
  assert.deepEqual(
    { type, props, children },
    {
      type: "div",
      props: { id: "root" },
      children: ["Hello"],
    },
  );

  await React.act(async () => {
    root.unmount();
  });

  console.log(`${format}: ok`);
}
