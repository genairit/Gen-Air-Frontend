import { github, project, service, defineRailway } from "railway/iac";

export const partial = "Gen-Air-Frontend";

const BACKEND_SERVICE = "Gen-Air-Backend";

const ENVIRONMENT_NAMES = {
  TEST: "test",
  PRODUCTION: "production",
  DEVELOPMENT: "development",
} as const;

type EnvironmentNameType = (typeof ENVIRONMENT_NAMES)[keyof typeof ENVIRONMENT_NAMES];

const BRANCH_BY_ENVIRONMENT: Record<EnvironmentNameType, string> = {
  [ENVIRONMENT_NAMES.TEST]: "test",
  [ENVIRONMENT_NAMES.PRODUCTION]: "main",
  [ENVIRONMENT_NAMES.DEVELOPMENT]: "dev",
};

const BACKEND_PRIVATE_URL = `http://\${{${BACKEND_SERVICE}.RAILWAY_PRIVATE_DOMAIN}}:\${{${BACKEND_SERVICE}.PORT}}`;

const isEnvironmentName = (name?: string | null): name is EnvironmentNameType =>
  Object.values(ENVIRONMENT_NAMES).some(environmentName => environmentName === name);

const resolveBranch = (environmentName?: string | null): string => {
  if (!isEnvironmentName(environmentName)) {
    throw new Error(`No branch mapped for Railway environment "${environmentName}"`);
  }

  return BRANCH_BY_ENVIRONMENT[environmentName];
};

export default defineRailway(context => {
  const frontend = service(partial, {
    healthcheck: "/",
    regions: { "europe-west4-drams3a": 1 },
    env: { PORT: "8080", BACKEND_URL: BACKEND_PRIVATE_URL },
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    source: github("kfirmr/Gen-Air-Frontend", {
      branch: resolveBranch(context.environmentName),
    }),
  });

  return project("gen-air", { resources: [frontend] });
});
