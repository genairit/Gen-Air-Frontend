import type { FC } from "react";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
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
  <Card gap="22px" padding="28px">
    <CardHeader
      icon={ICON_NAMES.LOCATION}
      title={PROJECT_ADDRESS_COPY.LABEL}
      subtitle={PROJECT_ADDRESS_COPY.SUBTITLE}
    />
    <AddressAutocomplete
      value={address}
      onChange={onChange}
      requiresCity={requiresCity}
      title={PROJECT_ADDRESS_COPY.LABEL}
      showMissingError={showMissingError}
    />
  </Card>
);
export default ProjectAddressCard;
