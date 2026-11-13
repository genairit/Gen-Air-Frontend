import { runBundledTest } from "./test-runner.utility.mjs";
import { componentStyleTestPlugin } from "./quotation-render.test-plugin.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";
await runBundledTest({ input: "testing/project-boq.test.tsx", output: "project-boq.test.mjs", external: ["@tanstack/react-query", "react-router-dom", "axios"], plugins: [componentStyleTestPlugin, loadingAnimationTestPlugin] });
