import Chip from "../Chip/Chip";
import type { FC } from "react";
import { CHIP_SIZES } from "../../constants/chip.constant";
import { SYNC_CHIP_BY_STATUS } from "../../constants/customer.constant";
import type { PrioritySyncStatusType } from "../../constants/priority-sync.constant";

interface ICustomerSyncChipProps {
  status: PrioritySyncStatusType;
}

const CustomerSyncChip: FC<ICustomerSyncChipProps> = ({ status }) => {
  const config = SYNC_CHIP_BY_STATUS[status];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={CHIP_SIZES.MEDIUM}
      variant={config.variant}
    />
  );
};

export default CustomerSyncChip;
