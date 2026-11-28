import { runBundledTest } from "./test-runner.utility.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";

await runBundledTest({
  input: "testing/data-table-row-action.test.tsx",
  output: "data-table-row-action.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
  plugins: [loadingAnimationTestPlugin],
});
