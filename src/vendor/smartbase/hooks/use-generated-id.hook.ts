import * as React from "react";
import { useState } from "react";

const GENERATED_ID_PREFIX = "sbc";

const generatedIdCounter = { value: 0 };

const createFallbackId = (): string => {
  generatedIdCounter.value += 1;

  return `${GENERATED_ID_PREFIX}-${generatedIdCounter.value}`;
};

const useFallbackId = (): string => {
  const [fallbackId] = useState<string>(createFallbackId);

  return fallbackId;
};

// React 17 has no `useId`; resolving once at module scope keeps the hook call unconditional.
const useResolvedId: () => string = typeof React.useId === "function" ? React.useId : useFallbackId;

export const useGeneratedId = (): string => useResolvedId();
