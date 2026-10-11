import { useMutation } from "@tanstack/react-query";
import { verifyAddressAction } from "../../actions/address.action";

export const useVerifyAddressMutation = () => useMutation({ mutationFn: verifyAddressAction });
