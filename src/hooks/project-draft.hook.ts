import { useEffect } from "react";
import { saveProjectDraft } from "../utilities/project-draft.utility";
import type { IProjectFormValues } from "../interfaces/project.interface";

export const useProjectDraft = (userId: string | null, values: IProjectFormValues): void => {
  useEffect(() => {
    saveProjectDraft(userId, values);
  }, [userId, values]);
};
