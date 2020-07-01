// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default {
  input: "js/index.js",
  output: {
    format: "umd",
    dir: "lib",
    name: "index",
  },
  plugins: [resolve(), babel({ babelHelpers: "bundled" })],
};
