import type { FC } from "react";
import type { IVerifiedAddress } from "../../../interfaces/project.interface";
import { PROJECT_ADDRESS_COPY } from "../../../constants/project-address.constant";
import AddressAutocomplete from "../../../components/AddressAutocomplete/AddressAutocomplete";

interface IProjectAddressCardProps {
  requiresCity: boolean;
  showMissingError: boolean;
  address: IVerifiedAddress | null;
  onChange: (address: IVerifiedAddress | null) => void;
}
const ProjectAddressCard: FC<IProjectAddressCardProps> = ({
  address,
  onChange,
  requiresCity,
  showMissingError,
}) => (
  <AddressAutocomplete
    value={address}
    onChange={onChange}
    requiresCity={requiresCity}
    title={PROJECT_ADDRESS_COPY.LABEL}
    showMissingError={showMissingError}
  />
);
export default ProjectAddressCard;
