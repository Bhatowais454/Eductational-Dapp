const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script", // CommonJS
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "no-undef": "off", // allow require/module/exports
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", { allowTemplateLiterals: true }],
      "no-restricted-globals": ["error", "name", "length"],
    },
  },
  {
    files: ["**/*.spec.*"],
    languageOptions: {
      globals: {
        mocha: "readonly",
      },
    },
  },
];

