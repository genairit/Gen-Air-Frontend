import { useLayoutEffect, useMemo } from "react";
import { QuotationCloneCommand } from "../actions/quotation-clone.actions";

interface ICloneCommandScope {
  routeKey: string;
  command: QuotationCloneCommand;
}

export const useQuotationCloneCommand = (
  sourceId: string,
  routeKey: string,
): QuotationCloneCommand => {
  const { command } = useMemo(
    (): ICloneCommandScope => ({ routeKey, command: new QuotationCloneCommand(sourceId) }),
    [sourceId, routeKey],
  );
  useLayoutEffect((): (() => void) => {
    command.activate();
    return (): void => command.deactivate();
  }, [command]);
  return command;
};
