/**
 * Production static export for GitHub Pages
 * (https://midhunkrishnan-131.github.io/midhun-krishnan-3d-portfolio/).
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

process.env.GITHUB_PAGES = "true";
process.env.NEXT_PUBLIC_BASE_PATH = "/midhun-krishnan-3d-portfolio";
process.env.NEXT_PUBLIC_SITE_URL =
  "https://midhunkrishnan-131.github.io/midhun-krishnan-3d-portfolio";

const result = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

// GitHub Pages otherwise treats `_next` as a hidden Jekyll folder.
writeFileSync(path.join(root, "out", ".nojekyll"), "");

// Next 16 file-convention icons omit basePath in <link rel="icon">
// and in escaped RSC payloads. Prefix every leftover root-relative icon URL.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH;

function prefixIcons(source) {
  const replacements = [
    ['"href":"/icon', `"href":"${BASE}/icon`],
    ['"href":"/apple-icon', `"href":"${BASE}/apple-icon`],
    ['\\"href\\":\\"/icon', `\\"href\\":\\"${BASE}/icon`],
    ['\\"href\\":\\"/apple-icon', `\\"href\\":\\"${BASE}/apple-icon`],
    ['href="/icon', `href="${BASE}/icon`],
    ['href="/apple-icon', `href="${BASE}/apple-icon`],
  ];
  let next = source;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  // Undo a double prefix if the rewrite ran twice.
  next = next.split(`${BASE}${BASE}/`).join(`${BASE}/`);
  return next;
}

function rewrite(dir) {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) {
      rewrite(file);
      continue;
    }
    if (!/\.(html|txt|xml|webmanifest)$/.test(name)) continue;
    const before = readFileSync(file, "utf8");
    const after = prefixIcons(before);
    if (after !== before) writeFileSync(file, after);
  }
}

rewrite(path.join(root, "out"));
