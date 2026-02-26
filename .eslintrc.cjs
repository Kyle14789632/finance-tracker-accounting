module.exports = {
  root: true,
  env: {
    es2022: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".turbo/",
    "coverage/",
    "apps/*/dist/",
    "packages/*/dist/"
  ],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
  },
  overrides: [
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      env: {
        browser: true,
        es2022: true
      },
      plugins: ["react", "react-hooks", "react-refresh"],
      extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      settings: {
        react: {
          version: "detect"
        }
      },
      rules: {
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
      }
    },
    {
      files: ["apps/api/**/*.ts", "packages/shared/**/*.ts"],
      env: {
        node: true,
        es2022: true
      }
    }
  ]
};
