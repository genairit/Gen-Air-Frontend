import Card from "../Card/Card";
import type { FC, ReactNode } from "react";
import CardHeader from "../CardHeader/CardHeader";
import { ICON_NAMES } from "../../constants/icon.constant";
import ProjectContactRoleFields from "./ProjectContactRoleFields";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { PROJECT_CONTACT_ROLE_COPY } from "../../constants/project-contact-role.constant";
import type { ProjectContactRoleType } from "../../constants/project-contact-role.constant";
import type { TProjectRoleContacts } from "../../interfaces/project-contact-role.interface";

interface IProjectRoleContactsCardProps {
  disabled: boolean;
  children?: ReactNode;
  canEditDetails: boolean;
  canCreateContact?: boolean;
  contacts: TProjectRoleContacts;
  onActivityChange?: (role: ProjectContactRoleType, active: boolean) => void;
  onChange: (role: ProjectContactRoleType, contact: ICustomerContact | null) => void;
}
const ProjectRoleContactsCard: FC<IProjectRoleContactsCardProps> = ({
  contacts,
  disabled,
  canEditDetails,
  canCreateContact = false,
  onChange,
  children,
  onActivityChange,
}) => (
  <Card>
    <CardHeader icon={ICON_NAMES.CONTACTS} title={PROJECT_CONTACT_ROLE_COPY.TITLE} />
    <ProjectContactRoleFields
      canEdit
      disabled={disabled}
      contacts={contacts}
      onChange={onChange}
      canEditDetails={canEditDetails}
      canCreateContact={canCreateContact}
      onActivityChange={onActivityChange}
    />
    {children}
  </Card>
);
export default ProjectRoleContactsCard;
