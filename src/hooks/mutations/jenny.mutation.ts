import { askJennyAction } from "../../actions/jenny.action";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { IAskJennyInput, IJennyThreadMessage } from "../../interfaces/jenny.interface";

export const useAskJennyMutation = (): UseMutationResult<
  IJennyThreadMessage,
  Error,
  IAskJennyInput
> => useMutation({ mutationFn: askJennyAction });
