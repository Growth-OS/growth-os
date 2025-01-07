import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Login from "@/pages/Login";
import Join from "@/pages/Join";
import Dashboard from "@/pages/Dashboard";
import TeamSettings from "@/pages/TeamSettings";
import Invoices from "@/pages/Invoices";
import Projects from "@/pages/Projects";
import Tasks from "@/pages/Tasks";
import Prospects from "@/pages/Prospects";
import Deals from "@/pages/Deals";
import Finances from "@/pages/Finances";

export const router = createBrowserRouter([
  {
    element: <AuthProvider><Layout /></AuthProvider>,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/team-settings",
        element: <TeamSettings />,
      },
      {
        path: "/invoices",
        element: <Invoices />,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/tasks",
        element: <Tasks />,
      },
      {
        path: "/prospects",
        element: <Prospects />,
      },
      {
        path: "/deals",
        element: <Deals />,
      },
      {
        path: "/finances",
        element: <Finances />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/join",
    element: <Join />,
  },
]);