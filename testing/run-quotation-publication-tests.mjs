import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/quotation-publication.test.tsx",
  output: "quotation-publication.test.mjs",
  external: ["@tanstack/react-query", "axios"],
});
