import {
  addEmployeeAction,
  removeEmployeeAction,
  updateMyPasswordAction,
} from "../../actions/employee.action";

import { useMutation } from "@tanstack/react-query";
import { loginAction } from "../../actions/session.action";

export const useLoginMutation = () => useMutation({ mutationFn: loginAction });

export const useAddEmployeeMutation = () => useMutation({ mutationFn: addEmployeeAction });

export const useRemoveEmployeeMutation = () => useMutation({ mutationFn: removeEmployeeAction });

export const useUpdatePasswordMutation = () => useMutation({ mutationFn: updateMyPasswordAction });
