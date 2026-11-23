import { runBundledTest } from "./test-runner.utility.mjs";
import { componentStyleTestPlugin } from "./quotation-render.test-plugin.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";

await runBundledTest({
  input: "testing/quotation-clone.test.tsx",
  output: "quotation-clone.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [componentStyleTestPlugin, loadingAnimationTestPlugin],
});
