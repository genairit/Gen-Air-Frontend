import { addressService } from "../services/address.service";
import { toVerifiedAddress } from "../utilities/address.utility";
import type { IVerifiedAddress } from "../interfaces/project.interface";
import type { IAddressLookup } from "../interfaces/api-request.interface";
import { AuthorizationContext } from "../managers/authorization-context.manager";

export const verifyAddressAction = async (lookup: IAddressLookup): Promise<IVerifiedAddress> => {
  const context = new AuthorizationContext();
  const address = await addressService.getVerifiedAddress(lookup);
  context.assertCurrent();
  return toVerifiedAddress(address);
};
