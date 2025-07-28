const { ESLint } = require("eslint");

/** @type {ESLint.ConfigData} */
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc", ".eslintrc.js"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        args: "after-used",
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      "warn"
    ]
  },
};
