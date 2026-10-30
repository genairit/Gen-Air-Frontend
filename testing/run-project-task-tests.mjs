import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/project-tasks.utility.test.ts",
  output: "project-tasks.utility.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/project-tasks.components.test.tsx",
  output: "project-tasks.components.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/project-tasks.interactions.test.tsx",
  output: "project-tasks.interactions.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});
