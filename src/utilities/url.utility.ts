import { logger } from "./logger.utility";

export const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch (error) {
    logger.warn("Ignoring an unparseable URL", { error, value });
    return null;
  }
};
