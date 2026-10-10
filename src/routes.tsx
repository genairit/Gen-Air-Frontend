import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/login/LoginPage";
import BoardPage from "./pages/board/BoardPage";
import type { RouteObject } from "react-router-dom";
import RequireSession from "./layouts/RequireSession";
import ProjectPage from "./pages/project/ProjectPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { ROUTE_PATHS } from "./constants/routes.constant";
import ComponentsShowcase from "./pages/ComponentsShowcase";
import EmployeesPage from "./pages/employees/EmployeesPage";
import ProjectFormPage from "./pages/project-form/ProjectFormPage";
import { PROJECT_FORM_MODES } from "./constants/project-form.constant";

export const routes: RouteObject[] = [
  { path: ROUTE_PATHS.LOGIN, element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTE_PATHS.BOARD, element: <BoardPage /> },
          { path: ROUTE_PATHS.PROJECT, element: <ProjectPage /> },
          { path: ROUTE_PATHS.SETTINGS, element: <SettingsPage /> },
          { path: ROUTE_PATHS.EMPLOYEES, element: <EmployeesPage /> },
          { path: ROUTE_PATHS.COMPONENTS, element: <ComponentsShowcase /> },
          {
            path: ROUTE_PATHS.NEW_PROJECT,
            element: <ProjectFormPage mode={PROJECT_FORM_MODES.NEW} />,
          },
          {
            path: ROUTE_PATHS.EDIT_PROJECT,
            element: <ProjectFormPage mode={PROJECT_FORM_MODES.EDIT} />,
          },
        ],
      },
    ],
  },
];
