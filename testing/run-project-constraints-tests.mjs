import { runBundledTest } from "./test-runner.utility.mjs";

for (const category of ["utility", "interactions"]) {
  await runBundledTest({
    input: `testing/project-constraints.${category}.test.${category === "utility" ? "ts" : "tsx"}`,
    output: `project-constraints.${category}.test.mjs`,
    external: ["@tanstack/react-query", "react-router-dom"],
  });
}
