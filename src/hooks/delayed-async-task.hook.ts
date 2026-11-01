import { useEffect } from "react";

interface IDelayedAsyncTaskOptions {
  delayMs: number;
  enabled: boolean;
  task: () => Promise<void>;
  onError: (error: unknown) => void;
}
export const useDelayedAsyncTask = ({
  enabled,
  delayMs,
  task,
  onError,
}: IDelayedAsyncTaskOptions): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await task();
      } catch (error) {
        onError(error);
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [enabled, delayMs, task, onError]);
};
