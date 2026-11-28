import { useLocation, useSearchParams } from "react-router-dom";

export const useProjectWorkspaceQuery = () => {
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const update = (key: string, value: string, replace = false) => {
    if ((params.get(key) ?? "") === value) return;
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace, state: location.state, preventScrollReset: true });
  };

  return { params, update };
};
