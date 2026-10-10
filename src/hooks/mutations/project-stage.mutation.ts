import { useMutation } from "@tanstack/react-query";
import { saveStageChangesAction } from "../../actions/project-stage.action";

export const useSaveStageChangesMutation = () =>
  useMutation({ mutationFn: saveStageChangesAction });
