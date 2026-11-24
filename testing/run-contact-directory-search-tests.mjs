import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/contact-directory-search.test.tsx",
  output: "contact-directory-search.test.mjs",
});
