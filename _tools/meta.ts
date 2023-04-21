import { BuildOptions } from "https://deno.land/x/dnt@0.34.0/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},

  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/reporting-middleware",
    version,
    description: "HTTP reporting middleware",
    keywords: [
      "http",
      "middleware",
      "reporting-api",
      "reporting",
      "reporting-endpoints",
      "report-to",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/reporting-middleware",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/reporting-middleware.git",
    },
    bugs: {
      url: "https://github.com/httpland/reporting-middleware/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
  mappings: {
    "https://deno.land/x/http_middleware@1.0.0/mod.ts": {
      name: "@httpland/http-middleware",
      version: "1.0.0",
    },
    "https://deno.land/x/http_utils@1.0.0/message.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0",
      subPath: "message.js",
    },
    "https://deno.land/x/isx@1.2.0/is_number.ts": {
      name: "@miyauci/isx",
      version: "1.2.0",
      subPath: "is_number",
    },
    "https://deno.land/x/assertion@1.0.0/number/assert_non_negative_integer.ts":
      {
        name: "@miyauci/assertion",
        version: "1.0.0",
        subPath: "number/assert_non_negative_integer.js",
      },
    "https://deno.land/x/isx@1.2.0/is_array.ts": {
      name: "@miyauci/isx",
      version: "1.2.0",
      subPath: "is_array",
    },
    "https://deno.land/x/prelude_js@1.2.0/last.ts": {
      name: "@miyauci/prelude",
      version: "1.2.0",
      subPath: "last.js",
    },
    "https://deno.land/x/sfv_parser@1.1.0/mod.ts": {
      name: "@httpland/sfv-parser",
      version: "1.1.0",
    },
    "https://deno.land/x/jfv_parser@1.0.0/mod.ts": {
      name: "@httpland/jfv-parser",
      version: "1.0.0",
    },
  },
});
