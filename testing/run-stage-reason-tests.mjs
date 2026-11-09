import { runBundledTest } from "./test-runner.utility.mjs";

const DIALOG_STUB_ID = "\0stage-reason-test-material";

await runBundledTest({
  input: "testing/stage-reason.utility.test.ts",
  output: "stage-reason.utility.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
});

await runBundledTest({
  input: "testing/stage-reason.interactions.test.tsx",
  output: "stage-reason.interactions.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios"],
  plugins: [
    {
      name: "stage-reason-portal-boundary",
      transform: (code, id) => {
        if (!id.endsWith("/GenericPopup/GenericPopup.tsx")) {
          return null;
        }

        return {
          code: code.replaceAll('from "@mui/material"', 'from "stage-reason-test-material"'),
        };
      },
      resolveId: source => (source === "stage-reason-test-material" ? DIALOG_STUB_ID : null),
      load: id => {
        if (id !== DIALOG_STUB_ID) {
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
