import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/customer-projects.utility.test.ts",
  output: "customer-projects.utility.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/customer-projects.data.test.ts",
  output: "customer-projects.data.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/customer-projects.interactions.test.tsx",
  output: "customer-projects.interactions.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});
