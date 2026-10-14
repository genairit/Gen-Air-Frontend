import { taskService } from "../../services/task.service";
import type { IApiTask } from "../../interfaces/task.interface";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import type { ITaskQuery } from "../../interfaces/task.interface";
import type { ICursorPage } from "../../interfaces/api.interface";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

const FIRST_PAGE_CURSOR: string | null = null;

const getNextCursor = (page: ICursorPage<IApiTask>) => page.nextCursor;

export const useTasksQuery = (query: ITaskQuery) =>
  useInfiniteQuery({
    getNextPageParam: getNextCursor,
    queryKey: QUERY_KEYS.tasks(query),
    initialPageParam: FIRST_PAGE_CURSOR,
    queryFn: ({ pageParam }) => taskService.getByFilter(query, pageParam),
  });

export const useTaskCountsQuery = (query: ITaskQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.taskCounts(query),
    queryFn: () => taskService.getCounts(query),
  });

export const useTaskQuery = (taskId: string | null) =>
  useQuery({
    enabled: Boolean(taskId),
    queryKey: QUERY_KEYS.task(taskId ?? ""),
    queryFn: () => taskService.getById(taskId ?? ""),
  });

export const useTaskTransitionsQuery = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.taskTransitions(taskId),
    queryFn: () => taskService.getTransitions(taskId),
  });
