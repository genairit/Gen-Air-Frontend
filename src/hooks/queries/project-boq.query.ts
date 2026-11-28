import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import { projectBoqService } from "../../services/project-boq.service";

export const useProjectBoqDocumentsQuery = (projectId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projectBoqDocuments(projectId),
    queryFn: () => projectBoqService.documents(projectId),
  });
