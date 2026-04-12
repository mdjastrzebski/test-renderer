import packageJson from "../package.json" with { type: "json" };

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);

  if (!match) {
    throw new Error(`Unsupported semver format: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareSemver(left, right) {
  if (left.major !== right.major) {
    return left.major - right.major;
  }

  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }

  return left.patch - right.patch;
}

function incrementCaretUpperBound(version) {
  if (version.major > 0) {
    return {
      major: version.major + 1,
      minor: 0,
      patch: 0,
    };
  }

  return {
    major: 0,
    minor: version.minor + 1,
    patch: 0,
  };
}

function incrementTildeUpperBound(version) {
  return {
    major: version.major,
    minor: version.minor + 1,
    patch: 0,
  };
}

function parseExclusiveUpperBounds(range) {
  const upperBounds = [];
  const lessThanMatches = range.matchAll(/<\s*(\d+\.\d+\.\d+(?:[-+][^\s|]+)?)/g);

  for (const match of lessThanMatches) {
    upperBounds.push(parseSemver(match[1]));
  }

  const caretMatches = range.matchAll(/\^(\d+\.\d+\.\d+(?:[-+][^\s|]+)?)/g);
  for (const match of caretMatches) {
    upperBounds.push(incrementCaretUpperBound(parseSemver(match[1])));
  }

  const tildeMatches = range.matchAll(/~(\d+\.\d+\.\d+(?:[-+][^\s|]+)?)/g);
  for (const match of tildeMatches) {
    upperBounds.push(incrementTildeUpperBound(parseSemver(match[1])));
  }

  return upperBounds;
}

function getReactSupportWindow(range) {
  const upperBounds = parseExclusiveUpperBounds(range);

  if (upperBounds.length === 0) {
    throw new Error(
      `Could not derive a supported React ceiling from peerDependencies.react: ${range}`,
    );
  }

  return upperBounds.reduce((lowest, candidate) =>
    compareSemver(candidate, lowest) < 0 ? candidate : lowest,
  );
}

function formatSemver(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function getSupportedLineLabel(upperBound) {
  if (upperBound.patch === 0 && upperBound.minor > 0) {
    return `${upperBound.major}.${upperBound.minor - 1}.x`;
  }

  if (upperBound.minor === 0 && upperBound.patch === 0) {
    return `${upperBound.major - 1}.x`;
  }

  return `<${formatSemver(upperBound)}`;
}

async function getLatestReactVersion() {
  const overriddenVersion = process.env.REACT_RELEASE_GUARD_LATEST;

  if (overriddenVersion) {
    return overriddenVersion;
  }

  const response = await fetch("https://registry.npmjs.org/react");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch react package metadata: ${response.status} ${response.statusText}`,
    );
  }

  const metadata = await response.json();
  const latestVersion = metadata?.["dist-tags"]?.latest;

  if (typeof latestVersion !== "string") {
    throw new Error("Missing dist-tags.latest in react package metadata");
  }

  return latestVersion;
}

async function main() {
  const latestVersion = await getLatestReactVersion();
  const parsedLatest = parseSemver(latestVersion);
  const peerRange = packageJson.peerDependencies?.react ?? "<missing>";
  const upperBound = getReactSupportWindow(peerRange);
  const supportedLineLabel = getSupportedLineLabel(upperBound);

  if (compareSemver(parsedLatest, upperBound) < 0) {
    console.log(`React ${latestVersion} is still within the supported line (${supportedLineLabel}).`);
    return;
  }

  const failureLines = [
    `React ${latestVersion} has been released on npm, but this repository only supports up to React ${supportedLineLabel}.`,
    `A plain npm install of test-renderer is no longer safely constrained for the newest React release.`,
    `Current peerDependencies.react: ${peerRange}`,
    `Current derived React ceiling: <${formatSemver(upperBound)}`,
    `Update the compatibility policy, add support for the new React line, and tighten the published peer dependency range before relying on latest again.`,
  ];

  throw new Error(failureLines.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
