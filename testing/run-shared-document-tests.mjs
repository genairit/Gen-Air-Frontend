import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/shared-document.test.ts",
  output: "shared-document.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});
