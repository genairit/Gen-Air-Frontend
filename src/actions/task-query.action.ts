import type { ITaskQueryRetry } from "../interfaces/task.interface";

export const retryTaskQueriesAction = async ({
  refetchTasks,
  refetchCounts,
}: ITaskQueryRetry): Promise<void> => {
  await Promise.all([refetchTasks(), refetchCounts()]);
};
