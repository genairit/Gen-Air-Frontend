import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";

const API_PROXY_PREFIX = "/api";
const DEFAULT_BACKEND_URL = "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    server: {
      proxy: {
        // The backend has no CORS setup, so in development the API is reached through this proxy.
        [API_PROXY_PREFIX]: {
          changeOrigin: true,
          target: environment.VITE_BACKEND_URL || DEFAULT_BACKEND_URL,
          rewrite: path => path.replace(new RegExp(`^${API_PROXY_PREFIX}`), ""),
        },
      },
    },
  };
});
