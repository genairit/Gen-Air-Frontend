import Button from "../../components/Button/Button";
import ApartmentView from "./components/ApartmentView";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { NAVIGATION_LABELS } from "../../constants/navigation.constant";
import { APARTMENT_PAGE_COPY } from "../../constants/apartment.constant";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { useProjectQuery, useProjectStagesQuery } from "../../hooks/queries/project.query";

const ApartmentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const buildingId = params[ROUTE_PARAMS.PROJECT_ID] ?? null;
  const apartmentId = params[ROUTE_PARAMS.APARTMENT_ID] ?? null;
  const buildingQuery = useProjectQuery(buildingId);
  const apartmentQuery = useProjectQuery(apartmentId);
  const stagesQuery = useProjectStagesQuery();

  if (buildingQuery.isPending || apartmentQuery.isPending) {
    return <LoadingState label={APARTMENT_PAGE_COPY.LOADING} />;
  }

  if (buildingQuery.isError || apartmentQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.HOME}
        title={APARTMENT_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(apartmentQuery.error ?? buildingQuery.error)}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={NAVIGATION_LABELS.BACK_TO_BOARD}
            onClick={() => navigate(ROUTE_PATHS.BOARD)}
          />
        }
      />
    );
  }

  return (
    <ApartmentView
      key={apartmentQuery.data.id}
      building={buildingQuery.data}
      stages={stagesQuery.data ?? []}
      apartment={apartmentQuery.data}
    />
  );
};

export default ApartmentPage;
