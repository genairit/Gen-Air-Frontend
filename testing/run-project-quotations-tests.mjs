import {
  tabsRendererTestPlugin,
  componentStyleTestPlugin,
} from "./quotation-render.test-plugin.mjs";

import { runBundledTest } from "./test-runner.utility.mjs";
import { autocompleteRendererPlugin } from "./autocomplete-renderer.plugin.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";

await runBundledTest({
  input: "testing/project-quotations.test.tsx",
  output: "project-quotations.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [
    autocompleteRendererPlugin,
    tabsRendererTestPlugin,
    componentStyleTestPlugin,
    loadingAnimationTestPlugin,
  ],
});
