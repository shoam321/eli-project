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
    // Legacy React Native app and migration artifacts not used by the Next.js web app.
    "android/**",
    "ios/**",
    "App.js",
    "index.js",
    "app.json",
    "metro.config.js",
    "ilabMobieManager-main/**",
    "src/actions/**",
    "src/config/**",
    "src/lang/**",
    "src/scenes/**",
    "src/components/*.js",
    "src/components/GesturePassword/**",
  ]),
]);

export default eslintConfig;
