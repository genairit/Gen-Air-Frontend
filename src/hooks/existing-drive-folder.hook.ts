import {
  DRIVE_FOLDER_MODES,
  type DriveFolderModeType,
} from "../constants/existing-drive-folder.constant";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./debounced-value.hook";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { SEARCH_DEBOUNCE_MS } from "../constants/search.constant";
import { projectActivityService } from "../services/project-activity.service";
import { toExistingDriveFolder } from "../utilities/existing-drive-folder.utility";
import { getExistingDriveFolderError } from "../utilities/existing-drive-folder-error.utility";
import type { IExistingDriveFolderState } from "../interfaces/existing-drive-folder.interface";

export const useExistingDriveFolder = (buildingId: string | null): IExistingDriveFolderState => {
  const [mode, setMode] = useState<DriveFolderModeType>(DRIVE_FOLDER_MODES.NEW);
  const [reference, setReference] = useState("");
  const trimmedReference = reference.trim();
  const debouncedReference = useDebouncedValue(trimmedReference, SEARCH_DEBOUNCE_MS);
  const isExisting = mode === DRIVE_FOLDER_MODES.EXISTING;
  const isCurrent = trimmedReference === debouncedReference;
  const hasReference = trimmedReference.length > 0;
  const enabled = isExisting && isCurrent && hasReference;
  const previewQuery = useQuery({
    enabled,
    retry: false,
    queryKey: [QUERY_ROOTS.EXISTING_DRIVE_PREVIEW, debouncedReference, buildingId],
    queryFn: ({ signal }) =>
      projectActivityService.previewExistingDriveFolder(debouncedReference, buildingId, signal),
  });
  const preview =
    enabled && previewQuery.isSuccess && !previewQuery.isFetching ? previewQuery.data : null;
  const existingDriveFolder = toExistingDriveFolder({ mode, isCurrent, preview });
  const canSubmit = !isExisting || existingDriveFolder !== null;
  const isPending = isExisting && hasReference && (!isCurrent || previewQuery.isFetching);
  const error =
    enabled && previewQuery.isError ? getExistingDriveFolderError(previewQuery.error) : null;
  const reset = () => {
    setMode(DRIVE_FOLDER_MODES.NEW);
    setReference("");
  };
  const retry = async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    await previewQuery.refetch();
  };

  return {
    mode,
    reference,
    preview,
    existingDriveFolder,
    canSubmit,
    isPending,
    error,
    setMode,
    setReference,
    reset,
    retry,
  };
};
