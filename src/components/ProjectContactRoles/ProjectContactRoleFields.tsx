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
  disabled: boolean;
  canEditDetails: boolean;
  contacts: TProjectRoleContacts;
  onChange: (
    role: ProjectContactRoleType,
    contact: ICustomerContact | null,
  ) => void | Promise<void>;
}
const ProjectContactRoleFields: FC<IProjectContactRoleFieldsProps> = ({
  contacts,
  canEdit,
  disabled,
  canEditDetails,
  onChange,
}) => {
  const styles = usePageStyles();
  return (
    <Box sx={styles.grid({ minColumnWidth: 250 })}>
      {Object.values(PROJECT_CONTACT_ROLES).map(role => (
        <ProjectContactRoleField
          key={role}
          role={role}
          canEdit={canEdit}
          disabled={disabled}
          contact={contacts[role]}
          canEditDetails={canEditDetails}
          onSelect={contact => onChange(role, contact)}
        />
      ))}
    </Box>
  );
};
export default ProjectContactRoleFields;
