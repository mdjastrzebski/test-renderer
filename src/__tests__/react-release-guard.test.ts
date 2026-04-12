import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "@jest/globals";

const scriptPath = resolve(process.cwd(), "scripts/check-react-release-guard.mjs");

describe("react release guard", () => {
  test("accepts the latest release within the supported React line", () => {
    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: "utf8",
      env: {
        ...process.env,
        REACT_RELEASE_GUARD_LATEST: "19.2.5",
      },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "React 19.2.5 is still within the supported window (React 19.0.x through 19.2.x).",
    );
    expect(result.stderr).toBe("");
  });

  test("fails when the latest release moves past the supported React line", () => {
    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: "utf8",
      env: {
        ...process.env,
        REACT_RELEASE_GUARD_LATEST: "19.3.0",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      "React 19.3.0 has been released on npm, but this repository currently supports only React 19.0.x through 19.2.x.",
    );
    expect(result.stderr).toContain("Current peerDependencies.react: ^19.0.0");
    expect(result.stderr).toContain("Configured supportedReactRange: >=19.0.0 <19.3.0");
    expect(result.stderr).toContain("Current derived React ceiling: <19.3.0");
  });
});
