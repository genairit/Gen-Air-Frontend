import { runBundledTest } from "./test-runner.utility.mjs";

const PORTAL_STUBS = {
  "/IconActionButton/IconActionButton.tsx": {
    source: "jenny-tooltip-material",
    stub: "export const Tooltip = ({ children }) => createElement(Fragment, null, children);",
  },
  "/Jenny/components/JennySheet.tsx": {
    source: "jenny-sheet-material",
    stub: 'export const Dialog = ({ open, children }) => (open ? createElement("section", null, children) : null);',
  },
};

const findPortalStub = id =>
  Object.entries(PORTAL_STUBS).find(([suffix]) => id.endsWith(suffix))?.[1] ?? null;

const findStubBySource = source =>
  Object.values(PORTAL_STUBS).find(stub => stub.source === source) ?? null;

await runBundledTest({
  input: "testing/jenny.test.tsx",
  output: "jenny.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios"],
  plugins: [
    {
      name: "jenny-portal-boundary",
      transform: (code, id) => {
        const portalStub = findPortalStub(id);

        if (portalStub === null) {
          return null;
        }

        return { code: code.replaceAll('from "@mui/material"', `from "${portalStub.source}"`) };
      },
      resolveId: source => (findStubBySource(source) === null ? null : `\0${source}`),
      load: id => {
        const portalStub = findStubBySource(id.replace("\0", ""));

        if (!id.startsWith("\0") || portalStub === null) {
          return null;
        }

        return {
          code: [
            'export * from "@mui/material";',
            'import { createElement, Fragment } from "react";',
            portalStub.stub,
          ].join("\n"),
          moduleType: "js",
        };
      },
    },
  ],
});
