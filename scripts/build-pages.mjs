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

// `output: "export"` needs force-static metadata routes, but the same
// `export const dynamic` breaks the default build (`cacheComponents`).
// Inject only for this Pages build, then restore the source files.
const FORCE_STATIC = 'export const dynamic = "force-static";\n\n';
const DYNAMIC_PARAMS = "export const dynamicParams = false;\n\n";
const STATIC_ROUTES = [
  "src/app/apple-icon.tsx",
  "src/app/icon.tsx",
  "src/app/index/opengraph-image.tsx",
  "src/app/manifest.ts",
  "src/app/opengraph-image.tsx",
  "src/app/projects/opengraph-image.tsx",
  "src/app/projects/[slug]/opengraph-image.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
];
const PARAM_ROUTES = ["src/app/projects/[slug]/page.tsx"];
const backups = new Map();

function firstMarker(source, markers) {
  let index = -1;
  for (const marker of markers) {
    const at = source.indexOf(marker);
    if (at !== -1 && (index === -1 || at < index)) index = at;
  }
  if (index === -1) {
    throw new Error(
      `Cannot inject Pages segment config: missing ${markers.join(", ")}`,
    );
  }
  return index;
}

function inject(rel, statement, already, markers) {
  const file = path.join(root, rel);
  const before = readFileSync(file, "utf8");
  if (!backups.has(file)) backups.set(file, before);
  if (before.includes(already)) return;
  const at = firstMarker(before, markers);
  writeFileSync(file, before.slice(0, at) + statement + before.slice(at));
}

try {
  for (const rel of STATIC_ROUTES) {
    inject(rel, FORCE_STATIC, 'export const dynamic = "force-static"', [
      "export function generateStaticParams",
      "export default",
      "export async function",
    ]);
  }
  for (const rel of PARAM_ROUTES) {
    inject(rel, DYNAMIC_PARAMS, "export const dynamicParams = false", [
      "export async function generateMetadata",
      "export default",
    ]);
  }

  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  for (const [file, before] of backups) {
    writeFileSync(file, before);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
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
