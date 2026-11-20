import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/purchase-workspace.test.tsx",
  output: "purchase-workspace.test.mjs",
  external: ["@tanstack/react-query", "axios"],
});
