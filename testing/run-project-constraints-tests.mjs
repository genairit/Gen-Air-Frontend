import { runBundledTest } from "./test-runner.utility.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";

for (const category of ["utility", "interactions"]) {
  await runBundledTest({
    input: `testing/project-constraints.${category}.test.${category === "utility" ? "ts" : "tsx"}`,
    output: `project-constraints.${category}.test.mjs`,
    external: ["@tanstack/react-query", "react-router-dom"],
    plugins: category === "interactions" ? [loadingAnimationTestPlugin] : [],
  });
}
