import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import NewApartmentForm from "./components/NewApartmentForm";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useProjectQuery } from "../../hooks/queries/project.query";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { PROJECT_PAGE_COPY, PROJECT_PAGE_STATUS_COPY } from "../../constants/project-page.constant";

const NewApartmentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const buildingId = params[ROUTE_PARAMS.PROJECT_ID] ?? null;
  const buildingQuery = useProjectQuery(buildingId);

  if (buildingQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING} />;
  }

  if (buildingQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.BUILDING}
        title={PROJECT_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(buildingQuery.error)}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PROJECT_PAGE_COPY.BACK_TO_BOARD}
            onClick={() => navigate(ROUTE_PATHS.BOARD)}
          />
        }
      />
    );
  }

  return <NewApartmentForm building={buildingQuery.data} />;
};

export default NewApartmentPage;
