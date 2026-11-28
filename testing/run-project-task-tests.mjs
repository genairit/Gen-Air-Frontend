import { runBundledTest } from "./test-runner.utility.mjs";
import { confirmationPopupRendererTestPlugin } from "./quotation-render.test-plugin.mjs";

await runBundledTest({
  input: "testing/project-tasks.utility.test.ts",
  output: "project-tasks.utility.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/task-status-cache.test.ts",
  output: "task-status-cache.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/project-tasks.components.test.tsx",
  output: "project-tasks.components.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/project-tasks.interactions.test.tsx",
  plugins: [confirmationPopupRendererTestPlugin],
  output: "project-tasks.interactions.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});
