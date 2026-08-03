#!/usr/bin/env node
// Tags every package version introduced or left untagged by the triggering push
// and publishes a combined GitHub release. Candidates come from base package
// identities and package tags rather than `pnpm publish --report-summary`, so a
// partially successful publish can be retried without losing earlier packages.
//
// Usage: node .github/scripts/github-releases.mjs <base-sha> <workspace-list.json>
// where the second file is the output of `pnpm list -r --depth -1 --json`.
// Requires GITHUB_TOKEN (contents: write), GITHUB_REPOSITORY and GITHUB_SHA.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";

const RELEASE_TAG_PREFIX = "release-";
const ZERO_SHA = /^0{40}$/;

const [baseSha, workspacePath] = process.argv.slice(2);

if (!baseSha || !workspacePath) {
  console.error("usage: github-releases.mjs <base-sha> <workspace-list.json>");
  process.exit(1);
}

if (!/^[0-9a-f]{40}$/i.test(baseSha)) {
  console.error(`invalid base commit: ${baseSha}`);
  process.exit(1);
}

/** @param {string[]} args */
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (!ZERO_SHA.test(baseSha)) {
  try {
    git(["cat-file", "-e", `${baseSha}^{commit}`]);
  } catch {
    console.error(`base commit is not available: ${baseSha}`);
    process.exit(1);
  }
}

/** @param {string} packagePath */
const manifestPathInRepository = (packagePath) => {
  const packageRelativePath = relative(process.cwd(), packagePath);
  if (
    packageRelativePath === "" ||
    packageRelativePath === ".." ||
    packageRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(packageRelativePath)
  ) {
    throw new Error(`workspace package is outside the repository: ${packagePath}`);
  }
  return `${packageRelativePath.split(sep).join("/")}/package.json`;
};

/** @param {string} manifestPath */
const manifestAtBase = (manifestPath) => {
  const object = `${baseSha}:${manifestPath}`;
  try {
    return JSON.parse(git(["show", object]));
  } catch (error) {
    console.error(`could not read ${manifestPath} at ${baseSha}:`, error);
    return process.exit(1);
  }
};

const baseManifests = (() => {
  /** @type {Map<string, { manifest: Record<string, unknown>, path: string }>} */
  const byPath = new Map();
  /** @type {Map<string, Array<{ manifest: Record<string, unknown>, path: string }>>} */
  const byName = new Map();

  if (ZERO_SHA.test(baseSha)) return { byPath, byName };

  const manifestPaths = git(["ls-tree", "-r", "--name-only", baseSha])
    .split("\n")
    .filter((path) => path === "package.json" || path.endsWith("/package.json"));

  for (const path of manifestPaths) {
    const manifest = manifestAtBase(path);
    const entry = { manifest, path };
    byPath.set(path, entry);
    if (typeof manifest.name !== "string") continue;
    const matches = byName.get(manifest.name) ?? [];
    matches.push(entry);
    byName.set(manifest.name, matches);
  }

  return { byPath, byName };
})();

/** @param {{ name: string, version: string, path: string }} entry */
const previousManifest = (entry) => {
  if (ZERO_SHA.test(baseSha)) return undefined;

  const currentPath = manifestPathInRepository(entry.path);
  const sameName = baseManifests.byName.get(entry.name) ?? [];
  if (sameName.length === 1) return sameName[0].manifest;
  if (sameName.length > 1) {
    const samePath = sameName.find(({ path }) => path === currentPath);
    if (samePath) return samePath.manifest;
    const sameVersion = sameName.filter(({ manifest }) => manifest.version === entry.version);
    if (sameVersion.length === 1) return sameVersion[0].manifest;
    throw new Error(`could not identify ${entry.name} uniquely at ${baseSha}`);
  }

  return baseManifests.byPath.get(currentPath)?.manifest;
};

/** @type {Array<{ name: string, version: string, path: string, private?: boolean }>} */
const workspace = JSON.parse(readFileSync(workspacePath, "utf8"));
const localTags = new Set(git(["tag", "--list"]).split("\n").filter(Boolean));
const currentCommit = git(["rev-parse", "HEAD"]);

/** @param {string} tag */
const localTagTarget = (tag) =>
  localTags.has(tag) ? git(["rev-list", "-n", "1", `refs/tags/${tag}`]) : undefined;

const releases = workspace
  .filter((entry) => entry.private !== true)
  .filter((entry) => {
    const previous = previousManifest(entry);
    const identityChanged =
      previous === undefined ||
      previous.private === true ||
      previous.name !== entry.name ||
      previous.version !== entry.version;
    const tagTarget = localTagTarget(`${entry.name}@${entry.version}`);
    return identityChanged || tagTarget === undefined || tagTarget === currentCommit;
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

if (releases.length === 0) {
  console.log("no package versions require a GitHub release");
  process.exit(0);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * @param {string} name
 * @param {string} version
 */
const registryHasVersion = async (name, version) => {
  const encodedName = encodeURIComponent(name);
  const encodedVersion = encodeURIComponent(version);
  const url = `https://registry.npmjs.org/${encodedName}/${encodedVersion}`;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (response.ok) return true;
      if (attempt === 5) {
        console.error(`npm does not serve ${name}@${version} (HTTP ${response.status})`);
        return false;
      }
    } catch (error) {
      if (attempt === 5) {
        console.error(`could not verify ${name}@${version} on npm:`, error);
        return false;
      }
    }
    await wait(2_000);
  }
  return false;
};

const registryChecks = await Promise.all(
  releases.map(({ name, version }) => registryHasVersion(name, version)),
);
if (registryChecks.includes(false)) process.exit(1);

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;
const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";

if (!token || !repository || !sha) {
  console.error("GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_SHA must be set");
  process.exit(1);
}

if (sha !== currentCommit) {
  console.error(`GITHUB_SHA ${sha} does not match the checked-out commit ${currentCommit}`);
  process.exit(1);
}

/**
 * @param {string} path
 * @param {"GET" | "POST"} method
 * @param {unknown} [body]
 */
const api = async (path, method, body) => {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, payload };
};

/** @param {string} tag */
const getTag = (tag) => api(`/repos/${repository}/git/ref/tags/${encodeURIComponent(tag)}`, "GET");

/** @param {string} tag */
const createTag = async (tag) => {
  const existing = await getTag(tag);
  if (existing.ok) {
    if (existing.payload.object?.sha !== sha) {
      console.error(`tag ${tag} exists at a different commit`);
      return false;
    }
    console.log(`tag ${tag} already exists at ${sha}, skipping`);
    return true;
  }
  if (existing.status !== 404) {
    console.error(`failed to inspect tag ${tag}:`, existing.payload);
    return false;
  }

  const response = await api(`/repos/${repository}/git/refs`, "POST", {
    ref: `refs/tags/${tag}`,
    sha,
  });
  if (response.ok) {
    console.log(`created tag ${tag}`);
    return true;
  }

  // A concurrent retry may have created the same ref after the GET above.
  if (response.status === 422) {
    const raced = await getTag(tag);
    if (raced.ok && raced.payload.object?.sha === sha) {
      console.log(`tag ${tag} already exists at ${sha}, skipping`);
      return true;
    }
  }

  console.error(`failed to create tag ${tag}:`, response.payload);
  return false;
};

/**
 * @param {string} packagePath
 * @param {string} version
 */
const changelogEntry = (packagePath, version) => {
  let changelog;
  try {
    changelog = readFileSync(join(packagePath, "CHANGELOG.md"), "utf8");
  } catch {
    return "";
  }
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim().replace(/[[\]]/g, "") === `## ${version}`);
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end))
    .join("\n")
    .replace(/^#{1,6}\s+(.+)$/gm, "**$1**")
    .trim();
};

// Tag of the previous combined release, so generated notes cover only commits
// released since then.
const previousReleaseTag = async () => {
  const response = await api(`/repos/${repository}/releases?per_page=100`, "GET");
  if (!response.ok) return "";
  /** @type {Array<{ tag_name: string, created_at: string }>} */
  const existingReleases = response.payload;
  return (
    existingReleases
      .filter((release) => release.tag_name.startsWith(RELEASE_TAG_PREFIX))
      .toSorted((a, b) => b.created_at.localeCompare(a.created_at))[0]?.tag_name ?? ""
  );
};

/**
 * @param {string} tag
 * @param {string} previousTag
 */
const generatedNotes = async (tag, previousTag) => {
  const response = await api(`/repos/${repository}/releases/generate-notes`, "POST", {
    tag_name: tag,
    target_commitish: sha,
    ...(previousTag ? { previous_tag_name: previousTag } : {}),
  });
  if (!response.ok) {
    console.warn(`failed to generate notes for ${tag}:`, response.payload);
    return "";
  }
  return (response.payload.body ?? "").trim();
};

let failed = false;
for (const { name, version } of releases) {
  if (!(await createTag(`${name}@${version}`))) failed = true;
}
if (failed) process.exit(1);

// A commit-derived tag makes retries idempotent, including retries after npm
// succeeded but GitHub release creation failed.
const releaseTag = `${RELEASE_TAG_PREFIX}${sha.slice(0, 12)}`;
const existingRelease = await api(
  `/repos/${repository}/releases/tags/${encodeURIComponent(releaseTag)}`,
  "GET",
);
if (existingRelease.ok) {
  console.log(`release ${releaseTag} already exists, skipping`);
  process.exit(0);
}
if (existingRelease.status !== 404) {
  console.error(`failed to inspect release ${releaseTag}:`, existingRelease.payload);
  process.exit(1);
}

const out = [];
out.push("## Published packages");
out.push("");
out.push("| Package | Version |");
out.push("| :--- | ---: |");

for (const { name, version } of releases) {
  out.push(`| [\`${name}\`](https://www.npmjs.com/package/${name}) | \`${version}\` |`);
}

out.push("");
out.push("### Changelogs");
out.push("");

for (const { name, version, path } of releases) {
  const entry = changelogEntry(path, version);
  out.push("<details>");
  out.push(`<summary><code>${name}@${version}</code></summary>`);
  out.push("");
  out.push("<br>");
  out.push("");
  out.push(entry || "_No changelog entry recorded._");
  out.push("");
  out.push("</details>");
  out.push("");
}

const previousTag = await previousReleaseTag();
const notes = await generatedNotes(releaseTag, previousTag);
if (notes) {
  out.push("---");
  out.push("");
  out.push(notes);
}

const created = await api(`/repos/${repository}/releases`, "POST", {
  tag_name: releaseTag,
  target_commitish: sha,
  name: releaseTag,
  body: out.join("\n").trim(),
  draft: false,
  prerelease: releases.every(({ version }) => version.includes("-")),
});

if (created.ok) {
  console.log(`created release ${releaseTag}`);
} else {
  console.error(`failed to create release ${releaseTag}:`, created.payload);
  process.exit(1);
}
