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
  contacts: TProjectRoleContacts;
  onChange: (role: ProjectContactRoleType, contact: ICustomerContact | null) => void;
}
const ProjectRoleContactsCard: FC<IProjectRoleContactsCardProps> = ({
  contacts,
  disabled,
  canEditDetails,
  onChange,
  children,
}) => (
  <Card>
    <CardHeader icon={ICON_NAMES.CONTACTS} title={PROJECT_CONTACT_ROLE_COPY.TITLE} />
    <ProjectContactRoleFields
      canEdit
      disabled={disabled}
      contacts={contacts}
      onChange={onChange}
      canEditDetails={canEditDetails}
    />
    {children}
  </Card>
);
export default ProjectRoleContactsCard;
