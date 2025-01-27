import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const DashboardActivity = () => {
  const navigate = useNavigate();

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["pending-tasks"],
    queryFn: async () => {
      console.log("Fetching pending tasks...");
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      console.log("Fetched tasks:", data);
      return data;
    }
  });

  const { data: meetings } = useQuery({
    queryKey: ["upcoming-meetings"],
    queryFn: async () => {
      console.log("Checking Google Calendar connection...");
      const { data: connection, error } = await supabase
        .from('oauth_connections')
        .select('*')
        .eq('provider', 'google')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking calendar connection:", error);
        throw error;
      }
      console.log("Calendar connection status:", !!connection);
      if (!connection) return { todayCount: 0 };

      // This would normally fetch from Google Calendar
      // For now, we'll return a placeholder
      return { todayCount: 2 };
    }
  });

  const pendingTasksCount = tasks?.length || 0;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
      <div className="space-y-4">
        <ActivityItem
          icon={Calendar}
          title="Upcoming Meetings"
          subtitle={`${meetings?.todayCount || 0} meetings today`}
          iconColor="gray"
          onClick={() => navigate('/calendar')}
        />
        <ActivityItem
          icon={ListTodo}
          title="Pending Tasks"
          subtitle={isLoadingTasks ? "Loading..." : `${pendingTasksCount} tasks due soon`}
          iconColor="gray"
          onClick={() => navigate('/tasks')}
        />
      </div>
    </Card>
  );
};

interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconColor: "gray";
  onClick: () => void;
}

const ActivityItem = ({ icon: Icon, title, subtitle, iconColor, onClick }: ActivityItemProps) => {
  const colorClasses = {
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full ${colorClasses[iconColor]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClick}>View</Button>
    </div>
  );
};