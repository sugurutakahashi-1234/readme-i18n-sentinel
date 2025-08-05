module.exports = {
  source: "README.md",
  target: "README.ja.md",
  checks: {
    lines: true,
    changes: true,
    headingsMatchSource: true,
  },
  output: {
    json: false,
  },
};
