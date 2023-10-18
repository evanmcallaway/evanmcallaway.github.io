module.exports = {
  "env": {
      "browser": true,
      "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
  },
  plugins: ["@html-eslint"],
  overrides: [
    {
      files: ["*.html"],
      parser: "@html-eslint/parser",
      extends: ["plugin:@html-eslint/recommended"],
    },
  ],
  rules: {
    "@html-eslint/indent": ["error", 2]
  }
}
