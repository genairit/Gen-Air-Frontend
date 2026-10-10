export const noop = () => {};

export const wait = (durationMs: number) =>
  new Promise<void>(resolve => setTimeout(resolve, durationMs));
