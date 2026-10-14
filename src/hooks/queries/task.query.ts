import { taskService } from "../../services/task.service";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import type { ITaskQuery } from "../../interfaces/task.interface";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const useTasksQuery = (query: ITaskQuery) =>
  useInfiniteQuery({
    queryKey: QUERY_KEYS.tasks(query),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => taskService.getByFilter(query, pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
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
