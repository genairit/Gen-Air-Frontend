import {
  tabsRendererTestPlugin,
  componentStyleTestPlugin,
  confirmationPopupRendererTestPlugin,
} from "./quotation-render.test-plugin.mjs";

import { runBundledTest } from "./test-runner.utility.mjs";
import { autocompleteRendererPlugin } from "./autocomplete-renderer.plugin.mjs";
import { loadingAnimationTestPlugin } from "./loading-animation.test-plugin.mjs";

await runBundledTest({
  input: "testing/task-quotations.test.tsx",
  output: "task-quotations.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [
    {
      name: "quotation-email-animation-boundary",
      transform: (code, id) => {
        if (!id.endsWith("/quotation-email/QuotationEmailDialog.tsx")) {
          return null;
        }

        return { code: code.replace('from "framer-motion"', 'from "test-email-motion"') };
      },
      resolveId: id => (id === "test-email-motion" ? "\0test-email-motion" : null),
      load: id =>
        id === "\0test-email-motion"
          ? {
              code: 'export * from "framer-motion"; export const AnimatePresence = ({ children }) => children;',
              moduleType: "js",
            }
          : null,
    },
    loadingAnimationTestPlugin,
    tabsRendererTestPlugin,
    componentStyleTestPlugin,
    confirmationPopupRendererTestPlugin,
    autocompleteRendererPlugin,
  ],
});
