import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { TEST_ROOT, runNodeTest, runBundledTest } from "./test-runner.utility.mjs";

runNodeTest(resolve(TEST_ROOT, "tests/user-role.test.mjs"));
runNodeTest(resolve(TEST_ROOT, "tests/session-permissions.test.mjs"));
runNodeTest(resolve(TEST_ROOT, "tests/apartment.test.mjs"));

const output = resolve(TEST_ROOT, "testing/user-roles.interactions.generated.mjs");
process.once("exit", () => rmSync(output, { force: true }));

await runBundledTest({
  input: "testing/user-roles.interactions.test.tsx",
  output,
  external: ["axios", "@tanstack/react-query", "react-router-dom"],
  plugins: [
    {
      name: "role-test-portal-boundary",
      transform: (code, id) => {
        const isPortalComponent =
          id.endsWith("/GenericPopup/GenericPopup.tsx") ||
          id.endsWith("/TopBar/UserMenuButton.tsx");

        if (!isPortalComponent) {
          return null;
        }

        return { code: code.replaceAll('from "@mui/material"', 'from "role-test-material"') };
      },
      resolveId: source => (source === "role-test-material" ? "\0role-test-material" : null),
      load: id => {
        if (id !== "\0role-test-material") {
          return null;
        }

        return {
          code: [
            'export * from "@mui/material";',
            'import { createElement } from "react";',
            'import { MenuList } from "@mui/material";',
            'export const Dialog = ({ children }) => createElement("section", null, children);',
            "export const Menu = ({ children, open }) => open ? createElement(MenuList, null, children) : null;",
          ].join("\n"),
          moduleType: "js",
        };
      },
    },
  ],
});

const passwordOutput = resolve(TEST_ROOT, "testing/password-security.generated.mjs");
process.once("exit", () => rmSync(passwordOutput, { force: true }));

await runBundledTest({
  input: "testing/password-security.test.tsx",
  output: passwordOutput,
  external: ["axios", "@tanstack/react-query", "react-router-dom"],
});

const historyOutput = resolve(TEST_ROOT, "testing/project-tasks.utility.generated.mjs");
process.once("exit", () => rmSync(historyOutput, { force: true }));

await runBundledTest({
  input: "testing/project-tasks.utility.test.ts",
  output: historyOutput,
  external: ["@tanstack/react-query", "react-router-dom"],
});
