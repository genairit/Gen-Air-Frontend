import type { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { IApiProject } from "../../../interfaces/api.interface";
import { buildApartmentPath } from "../../../utilities/route.utility";

interface IApartmentRedirectProps {
  project: IApiProject;
}

const ApartmentRedirect: FC<IApartmentRedirectProps> = ({ project }) => {
  const { search, hash, state } = useLocation();
  const pathname = buildApartmentPath(project.parentProjectId ?? "", project.id);
  return <Navigate replace state={state} to={{ pathname, search, hash }} />;
};

export default ApartmentRedirect;
