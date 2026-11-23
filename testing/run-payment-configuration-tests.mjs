import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/payment-configuration.test.tsx",
  output: "payment-configuration.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
});
