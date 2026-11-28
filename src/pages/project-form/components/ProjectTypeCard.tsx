import type { FC } from "react";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import type { IProjectTypeOption } from "../../../interfaces/project.interface";

interface IProjectTypeCardProps {
  selectedTypeId: string | null;
  options: IProjectTypeOption[];
  onSelect: (typeId: string) => void;
}

const ProjectTypeCard: FC<IProjectTypeCardProps> = ({ options, selectedTypeId, onSelect }) => (
  <Autocomplete
    isRequired
    isClearable={false}
    value={selectedTypeId}
    title={PROJECT_FORM_COPY.TYPE_TITLE}
    onChange={typeId => {
      if (typeId) onSelect(typeId);
    }}
    items={options.map(({ id, title, description }) => ({
      value: id,
      label: title,
      subtitle: description,
    }))}
  />
);
export default ProjectTypeCard;
