import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/customer-contact.test.tsx",
  output: "customer-contact.test.mjs",
  external: ["@tanstack/react-query"],
});

await runBundledTest({
  input: "testing/customer-contact.interactions.test.tsx",
  output: "customer-contact.interactions.test.mjs",
  external: ["@tanstack/react-query"],
});

await runBundledTest({
  input: "testing/design-alignment.components.test.tsx",
  output: "design-alignment.components.test.mjs",
});
