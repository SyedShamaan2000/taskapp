module.exports = {
  "*": "prettier --write --ignore-unknown",
  "frontend/**/*.{ts,tsx}": (filenames) =>
    `npx --prefix frontend eslint --config frontend/eslint.config.js --fix ${filenames.join(" ")}`,
  "backend/**/*.js": (filenames) =>
    `npx --prefix backend eslint --config backend/eslint.config.js --fix ${filenames.join(" ")}`,
};
