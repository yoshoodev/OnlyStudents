const path = require("path");

module.exports = {
  entry: {
    home: "./src/home.js",
    index: "./src/index.js",
    reset: "./src/passwordreset.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
