import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/task-sort.test.tsx",
  output: "task-sort.test.mjs",
});
