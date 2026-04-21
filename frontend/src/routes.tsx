import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "./components/auth/RequireAuth";
import { DashboardLayout } from "./app/layout/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { CompanyDetailPage } from "./pages/CompanyDetailPage";
import { PipelinePage } from "./pages/PipelinePage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { ContactsPage } from "./pages/ContactsPage";
import { EmailsPage } from "./pages/EmailsPage";
import { TasksPage } from "./pages/TasksPage";
import { ReportsPage } from "./pages/ReportsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true,           element: <DashboardPage /> },
      { path: "companies",     element: <CompaniesPage /> },
      { path: "companies/:id", element: <CompanyDetailPage /> },
      { path: "pipeline",      element: <PipelinePage /> },
      { path: "contacts",      element: <ContactsPage /> },
      { path: "meetings",      element: <MeetingsPage /> },
      { path: "emails",        element: <EmailsPage /> },
      { path: "tasks",         element: <TasksPage /> },
      { path: "reports",       element: <ReportsPage /> },
    ]
  }
]);
