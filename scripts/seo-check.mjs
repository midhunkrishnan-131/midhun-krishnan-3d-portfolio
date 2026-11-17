/**
 * Asserts technical SEO on a production build (`next build` then this script).
 * Starts `next start`, checks every page route that exists, and checks sitemap
 * URLs that are not routes yet (they are noted, not failed).
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filename) {
  const file = path.join(root, filename);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const DEFAULT_TITLE = "Midhun Krishnan — A Story Still Being Written";
const HOME_TYPES = ["Person", "ProfilePage", "WebSite"];

function canonicalFor(pathname) {
  if (pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

function normalizeUrl(value) {
  const url = new URL(value);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  return `${url.origin}${pathname}`;
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    );
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
  );
  return match ? decode(match[2] ?? match[3] ?? "") : "";
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

async function pageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "api" || entry.name.startsWith(".")) continue;
      files.push(...(await pageFiles(full)));
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function toPathname(file, appDir) {
  const segments = path
    .relative(appDir, path.dirname(file))
    .split(path.sep)
    .filter(
      (segment) =>
        segment && !segment.startsWith("(") && !segment.startsWith("@"),
    );
  if (segments.some((segment) => segment.includes("["))) return null;
  if (segments.length === 0) return "/";
  return `/${segments.join("/")}`;
}

async function projectSlugs() {
  const source = await readFile(
    path.join(root, "src/data/projects.ts"),
    "utf8",
  );
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

async function discoverRoutes() {
  const appDir = path.join(root, "src/app");
  const files = await pageFiles(appDir);
  const routes = new Set();
  let hasProjectSlugPage = false;
  let hasProjectsIndex = false;
  for (const file of files) {
    const pathname = toPathname(file, appDir);
    if (pathname) routes.add(pathname);
    const rel = path.relative(appDir, file);
    if (rel === path.join("projects", "page.tsx")) hasProjectsIndex = true;
    if (rel.includes("[slug]") && path.basename(file).startsWith("page.")) {
      hasProjectSlugPage = true;
    }
  }
  if (hasProjectsIndex) routes.add("/projects");
  if (hasProjectSlugPage) {
    for (const slug of await projectSlugs()) routes.add(`/projects/${slug}`);
  }
  return [...routes].sort((a, b) => a.localeCompare(b));
}

function typesIn(data) {
  const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
  const types = new Set();
  for (const node of nodes) {
    const value = node?.["@type"];
    const list = Array.isArray(value) ? value : value ? [value] : [];
    for (const type of list) types.add(type);
  }
  return types;
}

function assertRoute(pathname, html, failures) {
  const fail = (message) => failures.push(`${pathname}: ${message}`);

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch
    ? decode(titleMatch[1]).replace(/\s+/g, " ").trim()
    : "";
  if (!title) fail("missing <title>");
  else if (pathname === "/" && title !== DEFAULT_TITLE) {
    fail(
      `title is ${JSON.stringify(title)}, expected ${JSON.stringify(DEFAULT_TITLE)}`,
    );
  } else if (pathname !== "/" && !title.endsWith(" — Midhun Krishnan")) {
    fail(`title ${JSON.stringify(title)} does not use the template`);
  }

  const descriptionTag = tags(html, "meta").find(
    (tag) => attr(tag, "name").toLowerCase() === "description",
  );
  const description = descriptionTag
    ? attr(descriptionTag, "content").trim()
    : "";
  if (!description) fail("missing meta description");

  const canonicalTag = tags(html, "link").find(
    (tag) => attr(tag, "rel").toLowerCase() === "canonical",
  );
  const canonical = canonicalTag ? attr(canonicalTag, "href") : "";
  if (!canonical) fail("missing canonical");
  else {
    let parsed;
    try {
      parsed = new URL(canonical);
    } catch {
      fail(`canonical is not an absolute URL: ${canonical}`);
    }
    if (
      parsed &&
      normalizeUrl(canonical) !== normalizeUrl(canonicalFor(pathname))
    ) {
      fail(`canonical ${canonical} does not match ${canonicalFor(pathname)}`);
    }
  }

  const robotsTag = tags(html, "meta").find(
    (tag) => attr(tag, "name").toLowerCase() === "robots",
  );
  const robots = robotsTag ? attr(robotsTag, "content").toLowerCase() : "";
  if (!robots.includes("index") || !robots.includes("follow")) {
    fail(
      `robots meta should allow index, follow (got ${JSON.stringify(robots)})`,
    );
  }

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) fail(`expected exactly one <h1>, found ${h1Count}`);

  const jsonBlocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  if (jsonBlocks.length === 0) fail("missing JSON-LD");
  const types = new Set();
  for (const block of jsonBlocks) {
    let data;
    try {
      data = JSON.parse(block[1]);
    } catch (error) {
      fail(
        `JSON-LD is not valid JSON (${error instanceof Error ? error.message : error})`,
      );
      continue;
    }
    const context = data?.["@context"];
    if (context !== "https://schema.org") {
      fail(`JSON-LD @context is ${JSON.stringify(context)}`);
    }
    for (const type of typesIn(data)) types.add(type);
  }

  if (pathname === "/") {
    for (const type of HOME_TYPES) {
      if (!types.has(type)) fail(`JSON-LD graph is missing ${type}`);
    }
    const raw = jsonBlocks.map((block) => block[1]).join("\n");
    if (!raw.includes("https://github.com/midhunkrishnan-131")) {
      fail("JSON-LD is missing the verified GitHub profile");
    }
    if (
      !raw.includes("https://www.linkedin.com/in/midhun-krishnan-7b205a422")
    ) {
      fail("JSON-LD is missing the confirmed LinkedIn profile");
    }
  } else if (pathname.startsWith("/projects/")) {
    if (!types.has("BreadcrumbList"))
      fail("JSON-LD graph is missing BreadcrumbList");
    if (!types.has("SoftwareSourceCode") && !types.has("CreativeWork")) {
      fail("JSON-LD graph is missing SoftwareSourceCode or CreativeWork");
    }
  } else if (pathname === "/projects") {
    if (!types.has("BreadcrumbList"))
      fail("JSON-LD graph is missing BreadcrumbList");
  }

  const ogImage = tags(html, "meta").find(
    (tag) => attr(tag, "property").toLowerCase() === "og:image",
  );
  const twitterCard = tags(html, "meta").find(
    (tag) => attr(tag, "name").toLowerCase() === "twitter:card",
  );
  if (!ogImage || !attr(ogImage, "content")) fail("missing og:image");
  if (attr(twitterCard ?? "", "content") !== "summary_large_image") {
    fail("twitter:card is not summary_large_image");
  }

  return { description, ogImage: ogImage ? attr(ogImage, "content") : "" };
}

function retarget(absolute, origin) {
  const url = new URL(absolute, origin);
  const local = new URL(origin);
  url.protocol = local.protocol;
  url.host = local.host;
  return url;
}

async function main() {
  if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
    console.error("seo:check: no production build. Run npm run build first.");
    process.exit(1);
  }

  const port = Number(process.env.SEO_CHECK_PORT || 3456);
  const origin = `http://127.0.0.1:${port}`;
  const nextBin = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  const child = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });
  const stop = () => {
    if (child.exitCode === null) child.kill("SIGTERM");
  };
  process.on("exit", stop);

  const failures = [];
  const notes = [];
  try {
    const deadline = Date.now() + 45000;
    let ready = false;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(`next start exited ${child.exitCode}\n${logs}`);
      }
      try {
        const response = await fetch(`${origin}/`, { redirect: "manual" });
        if (response.status < 500) {
          ready = true;
          break;
        }
      } catch {
        // Server is still binding the port.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error(`next start did not become ready\n${logs}`);

    const routes = await discoverRoutes();
    const descriptions = new Map();
    console.log(`Checking ${routes.length} route(s) on ${origin}`);
    for (const pathname of routes) {
      const response = await fetch(`${origin}${pathname}`, {
        redirect: "follow",
      });
      if (!response.ok) {
        failures.push(`${pathname}: HTTP ${response.status}`);
        continue;
      }
      const html = await response.text();
      const { description, ogImage } = assertRoute(pathname, html, failures);
      if (description) {
        if ([...descriptions.values()].includes(description)) {
          failures.push(`${pathname}: description is not unique`);
        }
        descriptions.set(pathname, description);
      }
      if (ogImage) {
        const imageResponse = await fetch(retarget(ogImage, origin));
        const type = imageResponse.headers.get("content-type") ?? "";
        if (!imageResponse.ok || !type.startsWith("image/")) {
          failures.push(
            `${pathname}: og:image ${ogImage} returned HTTP ${imageResponse.status} ${type}`,
          );
        }
      }
      console.log(`  checked ${pathname}`);
    }

    const robotsResponse = await fetch(`${origin}/robots.txt`);
    const robotsText = await robotsResponse.text();
    if (!robotsResponse.ok)
      failures.push(`robots.txt: HTTP ${robotsResponse.status}`);
    if (!/^allow:\s*\/\s*$/im.test(robotsText)) {
      failures.push("robots.txt: expected Allow: /");
    }
    if (/^disallow:\s*\/\s*$/im.test(robotsText)) {
      failures.push("robots.txt: Disallow: / would block the site");
    }
    const sitemapLine = robotsText.match(/sitemap:\s*(\S+)/i);
    if (
      !sitemapLine ||
      normalizeUrl(sitemapLine[1]) !== normalizeUrl(`${SITE_URL}/sitemap.xml`)
    ) {
      failures.push(
        `robots.txt: sitemap link should be ${SITE_URL}/sitemap.xml (got ${sitemapLine?.[1] ?? "none"})`,
      );
    }

    const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
    const sitemapXml = await sitemapResponse.text();
    if (!sitemapResponse.ok)
      failures.push(`sitemap.xml: HTTP ${sitemapResponse.status}`);
    const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
      decode(match[1].trim()),
    );
    const slugs = await projectSlugs();
    const expected = [
      canonicalFor("/"),
      canonicalFor("/projects"),
      ...slugs.map((slug) => canonicalFor(`/projects/${slug}`)),
    ];
    for (const url of expected) {
      if (!locs.some((loc) => normalizeUrl(loc) === normalizeUrl(url))) {
        failures.push(`sitemap.xml: missing ${url}`);
      }
    }

    for (const url of expected) {
      const pathname = new URL(url).pathname;
      if (routes.includes(pathname)) continue;
      const response = await fetch(retarget(url, origin), {
        redirect: "manual",
      });
      if (response.status === 404) {
        notes.push(
          `${pathname} is in the sitemap but has no page on this branch (HTTP 404).`,
        );
      } else if (response.ok) {
        failures.push(
          `${pathname} returned HTTP ${response.status} but was not discovered as a page route`,
        );
      } else {
        failures.push(`${pathname}: unexpected HTTP ${response.status}`);
      }
    }

    const manifestResponse = await fetch(`${origin}/manifest.webmanifest`);
    if (!manifestResponse.ok) {
      failures.push(`manifest.webmanifest: HTTP ${manifestResponse.status}`);
    } else {
      const manifest = await manifestResponse.json();
      if (!manifest.name || !manifest.icons?.length) {
        failures.push("manifest.webmanifest: missing name or icons");
      }
    }

    const iconResponse = await fetch(`${origin}/icon`);
    const appleResponse = await fetch(`${origin}/apple-icon`);
    if (!iconResponse.ok) failures.push(`icon: HTTP ${iconResponse.status}`);
    if (!appleResponse.ok)
      failures.push(`apple-icon: HTTP ${appleResponse.status}`);

    const ogRoutes = [
      "/opengraph-image",
      "/projects/opengraph-image",
      ...slugs.map((slug) => `/projects/${slug}/opengraph-image`),
    ];
    for (const ogPath of ogRoutes) {
      const imageResponse = await fetch(`${origin}${ogPath}`);
      const type = imageResponse.headers.get("content-type") ?? "";
      if (!imageResponse.ok || !type.startsWith("image/")) {
        failures.push(
          `${ogPath}: HTTP ${imageResponse.status} ${type || "no content-type"}`,
        );
      }
    }

    if (notes.length) {
      console.log("\nNotes:");
      for (const note of notes) console.log(`  - ${note}`);
    }
    if (failures.length) {
      console.error("\nseo:check failed:");
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
      return;
    }
    console.log("\nseo:check passed.");
  } finally {
    stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
