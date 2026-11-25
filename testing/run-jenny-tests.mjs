import { runBundledTest } from "./test-runner.utility.mjs";

const TOOLTIP_STUB_ID = "\0jenny-tooltip-material";

await runBundledTest({
  input: "testing/jenny.test.tsx",
  output: "jenny.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios"],
  plugins: [
    {
      name: "jenny-tooltip-portal-boundary",
      transform: (code, id) => {
        if (!id.endsWith("/IconActionButton/IconActionButton.tsx")) {
          return null;
        }

        return { code: code.replaceAll('from "@mui/material"', 'from "jenny-tooltip-material"') };
      },
      resolveId: source => (source === "jenny-tooltip-material" ? TOOLTIP_STUB_ID : null),
      load: id => {
        if (id !== TOOLTIP_STUB_ID) {
          return null;
        }

        return {
          code: [
            'export * from "@mui/material";',
            'import { createElement, Fragment } from "react";',
            "export const Tooltip = ({ children }) => createElement(Fragment, null, children);",
          ].join("\n"),
          moduleType: "js",
        };
      },
    },
  ],
});
