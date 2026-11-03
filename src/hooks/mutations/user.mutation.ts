import {
  addEmployeeAction,
  removeEmployeeAction,
  updateMyPasswordAction,
  updateEmployeeRolesAction,
} from "../../actions/employee.action";

import { useMutation } from "@tanstack/react-query";
import { loginAction } from "../../actions/session.action";

export const useLoginMutation = () =>
  useMutation({ mutationFn: loginAction, meta: { authorizationIndependent: true } });

export const useAddEmployeeMutation = () => useMutation({ mutationFn: addEmployeeAction });

export const useUpdateEmployeeRolesMutation = () =>
  useMutation({ mutationFn: updateEmployeeRolesAction });

export const useRemoveEmployeeMutation = () => useMutation({ mutationFn: removeEmployeeAction });

export const useUpdatePasswordMutation = () => useMutation({ mutationFn: updateMyPasswordAction });
