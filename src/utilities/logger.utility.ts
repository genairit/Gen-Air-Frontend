type TLogContext = Record<string, unknown>;

export const logger = {
  warn: (message: string, context: TLogContext) => console.warn(message, context),
  error: (message: string, context: TLogContext) => console.error(message, context),
};
