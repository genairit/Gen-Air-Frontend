import { github, project, service, defineRailway } from "railway/iac";

export const partial = "Gen-Air-Frontend";

const BRANCH_BY_ENVIRONMENT: Record<string, string> = {
  test: "test",
  production: "main",
  development: "dev",
};

const BACKEND_PRIVATE_URL =
  "http://${{Gen-Air-Backend.RAILWAY_PRIVATE_DOMAIN}}:${{Gen-Air-Backend.PORT}}";

export default defineRailway(context => {
  const frontend = service("Gen-Air-Frontend", {
    healthcheck: "/",
    regions: { "europe-west4-drams3a": 1 },
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    env: { PORT: "8080", BACKEND_URL: BACKEND_PRIVATE_URL },
    source: github("kfirmr/Gen-Air-Frontend", {
      branch: BRANCH_BY_ENVIRONMENT[context.environmentName ?? "development"],
    }),
  });

  return project("gen-air", { resources: [frontend] });
});
