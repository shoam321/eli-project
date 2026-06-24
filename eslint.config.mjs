import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived mobile and conversion code that is not part of the active Next app.
    "android/**",
    "ios/**",
    "__MACOSX/**",
    "__tests__/**",
    "Web conversion/**",
    "ilabMobieManager-main/**",
    "App.js",
    "index.js",
    "metro.config.js",
    "src/actions/**",
    "src/config/**",
    "src/content/**",
    "src/lang/**",
    "src/reducers/**",
    "src/scenes/**",
    "src/utils/**",
    "src/components/*.js",
    "src/components/GesturePassword/**",
    "src/components/GesturePasswordView.js",
  ]),
]);

export default eslintConfig;
