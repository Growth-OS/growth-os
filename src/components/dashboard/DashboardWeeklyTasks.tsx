import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardWeeklyTasks = () => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["weekly-tasks"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          projects(id, name),
          deals(id, company_name),
          substack_posts(id, title)
        `)
        .eq("user_id", user.user.id)
        .eq("completed", false)
        .gte("due_date", startDate.toISOString())
        .lte("due_date", endDate.toISOString())
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Group tasks by source
  const groupedTasks = tasks?.reduce((acc, task) => {
    const source = task.source || "other";
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const getSourceTitle = (source: string) => {
    const titles: Record<string, string> = {
      deals: "Sales Tasks",
      content: "Content Tasks",
      ideas: "Ideas Tasks",
      substack: "Substack Tasks",
      projects: "Project Tasks",
      other: "Other Tasks"
    };
    return titles[source] || "Tasks";
  };

  if (isLoading) {
    return (
      <Card className="p-4 space-y-4 bg-background border">
        <div className="space-y-3">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-background border h-[calc(100vh-16rem)] overflow-auto">
      <h2 className="text-lg font-semibold mb-4">
        This Week ({format(startDate, "MMM d")} - {format(endDate, "MMM d")})
      </h2>
      
      <div className="space-y-6">
        {groupedTasks && Object.entries(groupedTasks).map(([source, sourceTasks]) => (
          <div key={source} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {getSourceTitle(source)}
            </h3>
            <div className="space-y-2">
              {sourceTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onComplete={async () => {
                    // Handled by the TaskCard component
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        
        {(!tasks || tasks.length === 0) && (
          <div className="text-center py-6 text-muted-foreground">
            No tasks due this week
          </div>
        )}
      </div>
    </Card>
  );
};