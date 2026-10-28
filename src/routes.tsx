import AppLayout from "./layouts/AppLayout";
import TaskPage from "./pages/task/TaskPage";
import LoginPage from "./pages/login/LoginPage";
import BoardPage from "./pages/board/BoardPage";
import TasksPage from "./pages/tasks/TasksPage";
import type { RouteObject } from "react-router-dom";
import RequireFeature from "./layouts/RequireFeature";
import RequireSession from "./layouts/RequireSession";
import ProjectPage from "./pages/project/ProjectPage";
import NewTaskPage from "./pages/task-form/NewTaskPage";
import SettingsPage from "./pages/settings/SettingsPage";
import CustomerPage from "./pages/customer/CustomerPage";
import { ROUTE_PATHS } from "./constants/routes.constant";
import ApartmentPage from "./pages/apartment/ApartmentPage";
import ComponentsShowcase from "./pages/ComponentsShowcase";
import EmployeesPage from "./pages/employees/EmployeesPage";
import CustomersPage from "./pages/customers/CustomersPage";
import { PERMISSIONS } from "./constants/permission.constant";
import ProjectFormPage from "./pages/project-form/ProjectFormPage";
import NewCustomerPage from "./pages/customer-form/NewCustomerPage";
import NewApartmentPage from "./pages/apartment-form/NewApartmentPage";
import { PROJECT_FORM_MODES } from "./constants/project-form.constant";

export const routes: RouteObject[] = [
  { path: ROUTE_PATHS.LOGIN, element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTE_PATHS.BOARD,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECTS_READ}>
                <BoardPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.PROJECT,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECTS_READ}>
                <ProjectPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.APARTMENT,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECTS_READ}>
                <ApartmentPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.NEW_APARTMENT,
            element: (
              <RequireFeature permission={PERMISSIONS.APARTMENTS_CREATE}>
                <NewApartmentPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.TASKS,
            element: (
              <RequireFeature permission={PERMISSIONS.TASKS_READ}>
                <TasksPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.TASK,
            element: (
              <RequireFeature permission={PERMISSIONS.TASKS_READ}>
                <TaskPage />
              </RequireFeature>
            ),
          },
          { path: ROUTE_PATHS.NEW_TASK, element: <NewTaskPage /> },
          { path: ROUTE_PATHS.SETTINGS, element: <SettingsPage /> },
          {
            path: ROUTE_PATHS.EMPLOYEES,
            element: (
              <RequireFeature permission={PERMISSIONS.EMPLOYEES_READ}>
                <EmployeesPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.CUSTOMERS,
            element: (
              <RequireFeature permission={PERMISSIONS.CUSTOMERS_READ}>
                <CustomersPage />
              </RequireFeature>
            ),
          },
          { path: ROUTE_PATHS.NEW_CUSTOMER, element: <NewCustomerPage /> },
          {
            path: ROUTE_PATHS.CUSTOMER,
            element: (
              <RequireFeature permission={PERMISSIONS.CUSTOMERS_READ}>
                <CustomerPage />
              </RequireFeature>
            ),
          },
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
