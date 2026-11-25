import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/jenny.test.tsx",
  output: "jenny.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios"],
});
