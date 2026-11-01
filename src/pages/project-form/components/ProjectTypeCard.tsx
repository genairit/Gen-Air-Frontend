import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import OptionCard from "../../../components/OptionCard/OptionCard";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import type { IProjectTypeOption } from "../../../interfaces/project.interface";

interface IProjectTypeCardProps {
  selectedTypeId: string | null;
  options: IProjectTypeOption[];
  onSelect: (typeId: string) => void;
}

const ProjectTypeCard: FC<IProjectTypeCardProps> = ({ options, selectedTypeId, onSelect }) => {
  const styles = usePageStyles();
  const typeGridStyle = {
    ...styles.grid({ minColumnWidth: 180, gap: "20px" }),
    alignItems: "stretch",
  };

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.HVAC}
        title={PROJECT_FORM_COPY.TYPE_TITLE}
        subtitle={PROJECT_FORM_COPY.TYPE_SUBTITLE}
      />
      <Box sx={typeGridStyle}>
        {options.map(option => (
          <OptionCard
            key={option.id}
            tag={option.tag}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            description={option.description}
            onSelect={() => onSelect(option.id)}
            isSelected={option.id === selectedTypeId}
          />
        ))}
      </Box>
    </Card>
  );
};

export default ProjectTypeCard;
