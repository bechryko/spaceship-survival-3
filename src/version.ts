export const appVersion = 'Beta 0.5';

const breakingVersions = ['Beta 0.3', 'Beta 0.4'];

interface Version {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): Version {
  const match = version.match(/^(Beta )?(\d+)\.(\d+)(?:\.(\d+))?$/);

  if (!match) {
    throw new Error(`Invalid version: ${version}`);
  }

  return {
    major: Number(match[2]),
    minor: Number(match[3]),
    patch: Number(match[4] ?? 0)
  };
}

function compareVersions(a: string, b: string): number {
  const v1 = parseVersion(a);
  const v2 = parseVersion(b);

  for (const key of ['major', 'minor', 'patch'] as const) {
    if (v1[key] !== v2[key]) {
      return v1[key] - v2[key];
    }
  }

  return 0;
}

export function didUpdateThroughBreakingVersion(lastVersion: string): boolean {
  return breakingVersions.some(
    breakingVersion =>
      compareVersions(lastVersion, breakingVersion) < 0 && compareVersions(appVersion, breakingVersion) >= 0
  );
}
