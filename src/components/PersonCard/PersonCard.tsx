import Card from "../Card/Card";
import type { FC, ReactNode } from "react";
import { useStyles } from "./PersonCard.style";
import PersonSummary from "../PersonSummary/PersonSummary";
import type { IPerson } from "../../interfaces/person.interface";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../constants/surface.constant";

interface IPersonCardProps {
  person: IPerson;
  action?: ReactNode;
}

const PersonCard: FC<IPersonCardProps> = ({ person, action }) => {
  const styles = useStyles();

  return (
    <Card
      padding="14px"
      sx={styles.card}
      radius={SURFACE_RADII.PANEL}
      depth={SURFACE_DEPTHS.RAISED_SOFT}
    >
      <PersonSummary nameSize={16} avatarSize={52} person={person} />
      {action}
    </Card>
  );
};

export default PersonCard;
