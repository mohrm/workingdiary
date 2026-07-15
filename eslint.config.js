// @ts-check
const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const ngPlugin = require("@angular-eslint/eslint-plugin");
const ngTemplatePlugin = require("@angular-eslint/eslint-plugin-template");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.app.json"],
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@angular-eslint": ngPlugin,
    },
    rules: {
      // keep your existing Angular selector rules
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      // include recommended TS rules if available
      ...(tsPlugin.configs?.recommended?.rules || {}),
    },
  },

  {
    files: ["**/*.html"],
    plugins: { "@angular-eslint/template": ngTemplatePlugin },
    rules: {
      ...(ngTemplatePlugin.configs?.recommended?.rules || {}),
      ...(ngTemplatePlugin.configs?.accessibility?.rules || {}),
    },
  },
];
