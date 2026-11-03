import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/customer-payment-default.test.tsx",
  output: "customer-payment-default.test.mjs",
  external: ["@tanstack/react-query"],
});
