import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/existing-drive-folder.test.ts",
  output: "existing-drive-folder.test.mjs",
});
