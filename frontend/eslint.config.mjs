import { fixupPluginRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import cssPlugin from "eslint-plugin-css";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier/flat";
import nextTs from "eslint-config-next/typescript";
import eslintNextPlugin from "@next/eslint-plugin-next";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Next's core web vitals rules for React/Next
  ...nextVitals,

  // Next's TypeScript rules (wraps plugin:@typescript-eslint/recommended)
  ...nextTs,

  // Prettier rules for formatting
  prettier,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      next: eslintNextPlugin,
      "@typescript-eslint": tsEslintPlugin,
      importPlugin: importPlugin.flatConfigs.recommended,
      css: fixupPluginRules(cssPlugin),
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "warn",

      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
