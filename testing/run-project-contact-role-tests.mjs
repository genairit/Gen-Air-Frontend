import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/project-contact-role.test.ts",
  output: "project-contact-role.test.mjs",
});
