import type { FC } from "react";
import { Navigate } from "react-router-dom";
import type { IApiProject } from "../../../interfaces/api.interface";
import { buildApartmentPath } from "../../../utilities/route.utility";

interface IApartmentRedirectProps {
  project: IApiProject;
}

const ApartmentRedirect: FC<IApartmentRedirectProps> = ({ project }) => (
  <Navigate replace to={buildApartmentPath(project.parentProjectId ?? "", project.id)} />
);

export default ApartmentRedirect;
