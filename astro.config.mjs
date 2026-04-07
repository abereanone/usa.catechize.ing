import { defineConfig } from "astro/config";
import path from "node:path";

export default defineConfig({
  site: "https://usa.catechize.ing",
  build: {
    format: "file",
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
