import { useLayoutEffect, useMemo } from "react";
import { QuotationCloneCommand } from "../actions/quotation-clone.actions";

export const useQuotationCloneCommand = (
  sourceId: string,
  routeKey: string,
): QuotationCloneCommand => {
  const { command } = useMemo(
    () => ({ routeKey, command: new QuotationCloneCommand(sourceId) }),
    [sourceId, routeKey],
  );
  useLayoutEffect(() => {
    command.activate();
    return (): void => command.deactivate();
  }, [command]);
  return command;
};
