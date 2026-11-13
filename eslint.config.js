import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

const svgElements = new Set([
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "g",
  "line",
  "linearGradient",
  "mask",
  "path",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "svg",
  "text",
  "use",
]);

const noNativeHtmlJsx = {
  meta: {
    type: "problem",
    messages: {
      nativeHtml:
        "Use a shared GenAir component or MUI component instead of a native HTML JSX element.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const name = node.name.name;
        if (/^[a-z]/.test(name) && !svgElements.has(name)) {
          context.report({ node, messageId: "nativeHtml" });
        }
      },
    };
  },
};

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/**/*.{tsx,jsx}"],
    plugins: { "genair-ui": { rules: { "no-native-html-jsx": noNativeHtmlJsx } } },
    rules: { "genair-ui/no-native-html-jsx": "error" },
  },
]);
