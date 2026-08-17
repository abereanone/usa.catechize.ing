import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import path from "node:path";

const categories = JSON.parse(
  fs.readFileSync(path.resolve("./src/data/categories.json"), "utf8")
);

// Questions are reachable at /questions/<slug> (canonical), /questions/<id>, and
// /questions/<GROUPCODE><id>. Only the canonical slug form belongs in the sitemap;
// the others already carry a <link rel="canonical"> pointing at it.
const groupCodes = categories
  .map((category) => category.groupCode)
  .filter(Boolean)
  .map((code) => String(code).toUpperCase());

const questionAliasPattern = new RegExp(
  `^/questions/(?:\\d+|(?:${groupCodes.join("|")})\\d+)(?:\\.html)?$`,
  "i"
);

export function sitemapFilter(page) {
  const { pathname } = new URL(page);

  // Client-side redirect stub, already noindex.
  if (/^\/random(?:\.html)?$/i.test(pathname)) {
    return false;
  }

  // /q/* are redirect stubs to /questions/*.
  if (pathname.startsWith("/q/")) {
    return false;
  }

  return !questionAliasPattern.test(pathname);
}

export default defineConfig({
  site: "https://usa.catechize.ing",
  build: {
    format: "file",
  },
  integrations: [sitemap({ filter: sitemapFilter })],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
