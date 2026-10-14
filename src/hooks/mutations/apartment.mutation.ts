import {
  createApartmentAction,
  updateApartmentAction,
  moveApartmentsToStageAction,
} from "../../actions/apartment.action";

import { useMutation } from "@tanstack/react-query";

export const useCreateApartmentMutation = () => useMutation({ mutationFn: createApartmentAction });

export const useUpdateApartmentMutation = () => useMutation({ mutationFn: updateApartmentAction });

export const useMoveApartmentsMutation = () =>
  useMutation({ mutationFn: moveApartmentsToStageAction });
