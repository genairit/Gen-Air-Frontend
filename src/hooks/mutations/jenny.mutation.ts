import { useMutation } from "@tanstack/react-query";
import { askJennyAction } from "../../actions/jenny.action";

export const useAskJennyMutation = () => useMutation({ mutationFn: askJennyAction });
