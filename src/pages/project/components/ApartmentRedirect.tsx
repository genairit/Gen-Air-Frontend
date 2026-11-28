import type { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { IApiProject } from "../../../interfaces/api.interface";
import { buildApartmentPath } from "../../../utilities/route.utility";

interface IApartmentRedirectProps {
  project: IApiProject;
}

const ApartmentRedirect: FC<IApartmentRedirectProps> = ({ project }) => {
  const location = useLocation();
  return (
    <Navigate
      replace
      to={buildApartmentPath(project.parentProjectId ?? "", project.id) + location.search}
    />
  );
};

export default ApartmentRedirect;
