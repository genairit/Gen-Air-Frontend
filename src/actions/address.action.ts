import { addressService } from "../services/address.service";
import { toVerifiedAddress } from "../utilities/address.utility";
import type { IAddressLookup } from "../interfaces/api-request.interface";

export const verifyAddressAction = async (lookup: IAddressLookup) =>
  toVerifiedAddress(await addressService.getVerifiedAddress(lookup));
