import { QUERY_KEYS } from "../../constants/query-key.constant";
import { projectService } from "../../services/project.service";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { projectTypeService } from "../../services/project-type.service";
import { projectStageService } from "../../services/project-stage.service";
import type { ICursorPage, IApiProject } from "../../interfaces/api.interface";
import { projectActivityService } from "../../services/project-activity.service";
import type { IProjectQuery, IProjectPageQuery } from "../../interfaces/api-request.interface";

export const useProjectStagesQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.PROJECT_STAGES, queryFn: () => projectStageService.getAll() });

export const useProjectTypesQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.PROJECT_TYPES, queryFn: () => projectTypeService.getAll() });

export const useProjectsQuery = (query: IProjectQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.projects(query),
    queryFn: () => projectService.getByFilter(query),
  });

const FIRST_PROJECT_PAGE_CURSOR: string | null = null;

const getNextProjectCursor = (page: ICursorPage<IApiProject>) => page.nextCursor;

export const useProjectPagesQuery = (query: IProjectPageQuery) =>
  useInfiniteQuery({
    getNextPageParam: getNextProjectCursor,
    queryKey: QUERY_KEYS.projectPages(query),
    initialPageParam: FIRST_PROJECT_PAGE_CURSOR,
    queryFn: ({ pageParam }) => projectService.getPage(query, pageParam),
  });

export const useProjectStageCountsQuery = (query: IProjectQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.stageCounts(query),
    queryFn: () => projectService.getStageCounts(query),
  });

export const useProjectQuery = (projectId: string | null) =>
  useQuery({
    enabled: Boolean(projectId),
    queryKey: QUERY_KEYS.project(projectId ?? ""),
    queryFn: () => projectService.getById(projectId ?? ""),
  });

export const useProjectTransitionsQuery = (projectId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.transitions(projectId),
    queryFn: () => projectActivityService.getTransitions(projectId),
  });

export const useProjectDriveQuery = (projectId: string, folderId: string | null) =>
  useQuery({
    retry: false,
    queryKey: QUERY_KEYS.driveContents(projectId, folderId),
    queryFn: () => projectActivityService.getDriveContents(projectId, folderId),
  });

export const useDriveTemplateQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.TEMPLATE_TREE,
    queryFn: () => projectActivityService.getTemplateTree(),
  });

export const useDriveUploadPolicyQuery = () =>
  useQuery({
    queryKey: ["drive-upload-policy"],
    queryFn: () => projectActivityService.getUploadPolicy(),
  });
