import { runBundledTest } from "./test-runner.utility.mjs";

const MATERIAL_STUB_ID = "\0popup-focus-material";

await runBundledTest({
  input: "testing/popup-focus.test.tsx",
  output: "popup-focus.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios"],
  plugins: [
    {
      name: "popup-focus-portal-boundary",
      transform: (code, id) => {
        if (!id.endsWith("/GenericPopup/GenericPopup.tsx")) {
          return null;
        }
        return { code: code.replaceAll('from "@mui/material"', 'from "popup-focus-material"') };
      },
      resolveId: source => (source === "popup-focus-material" ? MATERIAL_STUB_ID : null),
      load: id => {
        if (id !== MATERIAL_STUB_ID) {
          return null;
        }
        return {
          code: [
            'export * from "@mui/material";',
            'import { createElement } from "react";',
            'export const Dialog = ({ children }) => createElement("section", null, children);',
          ].join("\n"),
          moduleType: "js",
        };
      },
    },
  ],
});
