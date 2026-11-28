import AppLayout from "./layouts/AppLayout";
import TaskPage from "./pages/task/TaskPage";
import LoginPage from "./pages/login/LoginPage";
import BoardPage from "./pages/board/BoardPage";
import TasksPage from "./pages/tasks/TasksPage";
import RequireFeature from "./layouts/RequireFeature";
import RequireSession from "./layouts/RequireSession";
import ProjectPage from "./pages/project/ProjectPage";
import SettingsPage from "./pages/settings/SettingsPage";
import CustomerPage from "./pages/customer/CustomerPage";
import { ROUTE_PATHS } from "./constants/routes.constant";
import ApartmentPage from "./pages/apartment/ApartmentPage";
import ComponentsShowcase from "./pages/ComponentsShowcase";
import EmployeesPage from "./pages/employees/EmployeesPage";
import CustomersPage from "./pages/customers/CustomersPage";
import CataloguePage from "./pages/catalogue/CataloguePage";
import QuotationPage from "./pages/quotations/QuotationPage";
import { Navigate, type RouteObject } from "react-router-dom";
import { PERMISSIONS } from "./constants/permission.constant";
import ProjectBoqPage from "./pages/project-boq/ProjectBoqPage";
import ProjectFormPage from "./pages/project-form/ProjectFormPage";
import NewCustomerPage from "./pages/customer-form/NewCustomerPage";
import QuotationClonePage from "./pages/quotations/QuotationClonePage";
import NewApartmentPage from "./pages/apartment-form/NewApartmentPage";
import { PROJECT_FORM_MODES } from "./constants/project-form.constant";
import LegacyQuotationsRedirect from "./pages/quotations/LegacyQuotationsRedirect";
import ProjectQuotationCreatePage from "./pages/quotations/ProjectQuotationCreatePage";
import EngineeringEstimatesPage from "./pages/engineering-estimates/EngineeringEstimatesPage";

export const routes: RouteObject[] = [
  { path: ROUTE_PATHS.LOGIN, element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTE_PATHS.QUOTATIONS,
            element: <LegacyQuotationsRedirect />,
          },
          ...[
            { path: ROUTE_PATHS.PROJECT_QUOTATION_CREATE, element: <ProjectQuotationCreatePage /> },
            { path: ROUTE_PATHS.QUOTATION_CLONE, element: <QuotationClonePage /> },
          ].map(({ path, element }) => ({
            path,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECTS_READ}>
                <RequireFeature permission={PERMISSIONS.QUOTATIONS_READ}>
                  <RequireFeature permission={PERMISSIONS.QUOTATIONS_CREATE}>
                    {element}
                  </RequireFeature>
                </RequireFeature>
              </RequireFeature>
            ),
          })),
          {
            path: ROUTE_PATHS.CATALOGUE,
            element: (
              <RequireFeature permission={PERMISSIONS.QUOTATIONS_READ}>
                <CataloguePage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.QUOTATION,
            element: (
              <RequireFeature permission={PERMISSIONS.QUOTATIONS_READ}>
                <QuotationPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.BOARD,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECTS_READ}>
                <BoardPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.ENGINEERING_ESTIMATES,
            element: (
              <RequireFeature permission={PERMISSIONS.ENGINEERING_ESTIMATES_READ}>
                <EngineeringEstimatesPage />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.PROJECT_BOQS,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECT_BOQ_READ}>
                <Navigate replace to={ROUTE_PATHS.BOARD} />
              </RequireFeature>
            ),
          },
          {
            path: ROUTE_PATHS.PROJECT_BOQ,
            element: (
              <RequireFeature permission={PERMISSIONS.PROJECT_BOQ_READ}>
                <ProjectBoqPage />
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
          { path: ROUTE_PATHS.NEW_TASK, element: <Navigate replace to={ROUTE_PATHS.TASKS} /> },
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
