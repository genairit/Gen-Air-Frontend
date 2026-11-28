import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../pages/page.style";
import ProjectContactRoleField from "./ProjectContactRoleField";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { PROJECT_CONTACT_ROLES } from "../../constants/project-contact-role.constant";
import type { ProjectContactRoleType } from "../../constants/project-contact-role.constant";
import type { TProjectRoleContacts } from "../../interfaces/project-contact-role.interface";

interface IProjectContactRoleFieldsProps {
  canEdit: boolean;
  compact?: boolean;
  disabled: boolean;
  canEditDetails: boolean;
  canCreateContact?: boolean;
  contacts: TProjectRoleContacts;
  onActivityChange?: (role: ProjectContactRoleType, active: boolean) => void;
  onChange: (
    role: ProjectContactRoleType,
    contact: ICustomerContact | null,
  ) => void | Promise<void>;
}
const ProjectContactRoleFields: FC<IProjectContactRoleFieldsProps> = ({
  compact = false,
  contacts,
  canEdit,
  disabled,
  canEditDetails,
  canCreateContact = false,
  onChange,
  onActivityChange,
}) => {
  const styles = usePageStyles();
  return (
    <Box sx={compact ? styles.stack({ gap: "4px" }) : styles.grid({ minColumnWidth: 250 })}>
      {Object.values(PROJECT_CONTACT_ROLES).map(role => (
        <ProjectContactRoleField
          key={role}
          role={role}
          compact={compact}
          canEdit={canEdit}
          disabled={disabled}
          contact={contacts[role]}
          canEditDetails={canEditDetails}
          canCreateContact={canCreateContact}
          onSelect={contact => onChange(role, contact)}
          onActivityChange={active => onActivityChange?.(role, active)}
        />
      ))}
    </Box>
  );
};
export default ProjectContactRoleFields;
