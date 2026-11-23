import {
  readQuotationPublication,
  retryQuotationPublication,
} from "../actions/quotation-publication.action";

import type {
  IQuotationPublication,
  IQuotationPublicationRetry,
  IQuotationPublicationState,
} from "../interfaces/quotation-publication.interface";

import { useRef } from "react";
import { logger } from "../utilities/logger.utility";
import { useSessionUser } from "../store/session.store";
import { PERMISSIONS } from "../constants/permission.constant";
import { hasPermission } from "../utilities/permission.utility";
import { SessionRequestManager } from "../managers/session-request.manager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publicationPollInterval } from "../utilities/quotation-publication.utility";
import { PUBLICATION_COPY, publicationQueryKey } from "../constants/quotation-publication.constant";

export const useQuotationPublication = (
  id: string,
  version: number,
): IQuotationPublicationState => {
  const user = useSessionUser();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const generation = SessionRequestManager.getAuthorizationGeneration();
  const canRead = hasPermission(user, PERMISSIONS.QUOTATIONS_READ);
  const queryKey = publicationQueryKey(id, version, generation);
  const query = useQuery({
    queryKey,
    enabled: canRead,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: (): Promise<IQuotationPublication> => readQuotationPublication(id),
    refetchInterval: (current): number | false =>
      publicationPollInterval(current.state.data?.state ?? null, current.state.error !== null),
  });
  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: (input: IQuotationPublicationRetry): Promise<IQuotationPublication> =>
      retryQuotationPublication(id, input),
    onMutate: (): ReturnType<typeof publicationQueryKey> => queryKey,
    onSuccess: (publication, _input, startedKey): void => {
      if (
        startedKey == null ||
        startedKey[3] !== SessionRequestManager.getAuthorizationGeneration()
      ) {
        return;
      }

      queryClient.setQueryData(startedKey, publication);
    },
  });
  const publication = canRead ? (query.data ?? null) : null;
  const error = canRead && query.isError ? PUBLICATION_COPY.READ_ERROR : null;
  const retryError = mutation.isError ? PUBLICATION_COPY.RETRY_ERROR : error;
  const retry = async (): Promise<void> => {
    const cycleId = publication?.cycleId ?? null;
    const expectedGeneration = publication?.generation ?? null;
    const canRetry =
      publication?.canRetry === true && cycleId !== null && expectedGeneration !== null;
    const isCurrentAuthorization =
      generation === SessionRequestManager.getAuthorizationGeneration();
    if (
      !isCurrentAuthorization ||
      !canRead ||
      !canRetry ||
      inFlight.current ||
      cycleId === null ||
      expectedGeneration === null
    ) {
      return;
    }

    inFlight.current = true;
    try {
      await mutation.mutateAsync({ cycleId, generation: expectedGeneration });
    } catch (cause) {
      logger.error("Quotation publication retry was not accepted", {
        errorType: cause instanceof Error ? cause.name : "unknown",
      });
    } finally {
      inFlight.current = false;
    }
  };
  const refresh = async (): Promise<void> => {
    const isCurrentAuthorization =
      generation === SessionRequestManager.getAuthorizationGeneration();
    if (!canRead || !isCurrentAuthorization || query.isFetching) {
      return;
    }

    mutation.reset();
    await query.refetch();
  };
  const retryRequested =
    mutation.variables?.cycleId === publication?.cycleId &&
    mutation.variables?.generation === publication?.generation;
  return {
    publication,
    retry,
    retryRequested,
    refresh,
    refreshing: query.isFetching,
    busy: mutation.isPending,
    error: retryError,
  };
};
