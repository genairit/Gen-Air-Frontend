export const useHapticFeedback = () => ({
  vibrate: (durationMs = 10): void => {
    if (typeof navigator === "object" && "vibrate" in navigator) {
      navigator.vibrate(durationMs);
    }
  },
});
