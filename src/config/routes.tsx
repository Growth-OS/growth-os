import { RouteObject } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Prospects from "@/pages/Prospects";
import Tasks from "@/pages/Tasks";
import Deals from "@/pages/Deals";
import Projects from "@/pages/Projects";
import Calendar from "@/pages/Calendar";
import Affiliates from "@/pages/Affiliates";
import Finances from "@/pages/Finances";
import Reporting from "@/pages/Reporting";
import Development from "@/pages/Development";
import Invoices from "@/pages/Invoices";
import Boards from "@/pages/Boards";
import BoardView from "@/pages/BoardView";
import Sequences from "@/pages/Sequences";
import SequenceBuilder from "@/pages/SequenceBuilder";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <AuthProvider><Layout><Outlet /></Layout></AuthProvider>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "sequences",
        element: <Sequences />,
      },
      {
        path: "sequences/:sequenceId/edit",
        element: <SequenceBuilder />,
      },
      {
        path: "prospects",
        element: <Prospects />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "deals",
        element: <Deals />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "affiliates",
        element: <Affiliates />,
      },
      {
        path: "finances",
        element: <Finances />,
      },
      {
        path: "invoices",
        element: <Invoices />,
      },
      {
        path: "reporting",
        element: <Reporting />,
      },
      {
        path: "development",
        element: <Development />,
      },
      {
        path: "boards",
        element: <Boards />,
      },
      {
        path: "boards/:boardId",
        element: <BoardView />,
      },
    ],
  },
];
