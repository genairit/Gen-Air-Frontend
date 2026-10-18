import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { formatTypeSwitchTitle } from "../../../utilities/text.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { toTypeSwitchLines } from "../../../utilities/customer-details.utility";
import type { ITypeSwitchSummary } from "../../../interfaces/project.interface";
import { CUSTOMER_DETAILS_COPY } from "../../../constants/customer-details.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITypeSwitchBannerProps {
  typeName: string;
  onUndo: () => void;
  onDismiss: () => void;
  summary: ITypeSwitchSummary;
}

const TypeSwitchBanner: FC<ITypeSwitchBannerProps> = ({ typeName, summary, onUndo, onDismiss }) => (
  <NoticeBanner
    lines={toTypeSwitchLines(summary)}
    title={formatTypeSwitchTitle(typeName)}
    actions={
      <>
        <Button
          onClick={onUndo}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_DETAILS_COPY.UNDO_SWITCH}
        />
        <Button onClick={onDismiss} text={CUSTOMER_DETAILS_COPY.DISMISS_SWITCH} />
      </>
    }
  />
);

export default TypeSwitchBanner;
