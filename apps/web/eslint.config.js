import { nextJsConfig } from "@repo/eslint-config/next-js";
import reactCompiler from "eslint-plugin-react-compiler";

/** @type {import("eslint").Linter.Config} */
export default {
  ...nextJsConfig,
  plugins: [...nextJsConfig.plugins, reactCompiler],
  rules: {
    ...nextJsConfig.rules,
    "react-compiler/react-compiler": "error",
  },
};
