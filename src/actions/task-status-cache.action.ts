import { queryClient } from "../providers/query-client";
import type { IApiTask } from "../interfaces/task.interface";
import type { ICursorPage } from "../interfaces/api.interface";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import type { ITaskStatusChange, ITaskStatusSnapshot } from "../interfaces/task.interface";

type TTaskPages = InfiniteData<ICursorPage<IApiTask>>;

const patchTaskStatus = (task: IApiTask, change: ITaskStatusChange): IApiTask => {
  if (task.id !== change.taskId) {
    return task;
  }

  return { ...task, status: change.status, updatedAt: change.updatedAt ?? task.updatedAt };
};

const patchListStatus = (queryKey: QueryKey, change: ITaskStatusChange) => {
  queryClient.setQueryData<TTaskPages>(queryKey, current => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      pages: current.pages.map(page => ({
        ...page,
        items: page.items.map(task => patchTaskStatus(task, change)),
      })),
    };
  });
};

export const snapshotTaskStatusAction = (taskId: string): ITaskStatusSnapshot => ({
  task: queryClient.getQueryData<IApiTask>(QUERY_KEYS.task(taskId)) ?? null,
  lists: queryClient
    .getQueriesData<TTaskPages>({ queryKey: [QUERY_ROOTS.TASKS] })
    .flatMap(([queryKey, data]) => {
      const task = data?.pages.flatMap(page => page.items).find(task => task.id === taskId);
      return task ? [{ queryKey, status: task.status }] : [];
    }),
});

export const applyTaskStatusAction = (change: ITaskStatusChange) => {
  queryClient.setQueryData<IApiTask>(QUERY_KEYS.task(change.taskId), current =>
    current ? patchTaskStatus(current, change) : current,
  );
  queryClient
    .getQueriesData<TTaskPages>({ queryKey: [QUERY_ROOTS.TASKS] })
    .forEach(([queryKey]) => patchListStatus(queryKey, change));
};

export const restoreTaskStatusAction = (taskId: string, snapshot: ITaskStatusSnapshot) => {
  const previousStatus = snapshot.task?.status ?? null;
  if (previousStatus) {
    queryClient.setQueryData<IApiTask>(QUERY_KEYS.task(taskId), current =>
      current ? patchTaskStatus(current, { taskId, status: previousStatus }) : current,
    );
  }

  snapshot.lists.forEach(({ queryKey, status }) => patchListStatus(queryKey, { taskId, status }));
};
