import { Bot } from "lucide-react";

interface DashboardHeaderProps {
  firstName: string;
}

export const DashboardHeader = ({ firstName }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Welcome back, {firstName}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Here's an overview of your business activities and upcoming tasks.
      </p>
    </div>
  );
};