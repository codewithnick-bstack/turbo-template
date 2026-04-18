module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-require-imports": "warn",
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  ],
  ignorePatterns: [
    "node_modules",
    "dist",
    ".next",
    ".turbo",
    "*.config.js",
    "*.config.cjs",
    "*.config.mjs",
  ],
};
