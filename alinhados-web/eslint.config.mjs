import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**", "out/**"],
  },
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: { ...globals.node, ...globals.browser } }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
