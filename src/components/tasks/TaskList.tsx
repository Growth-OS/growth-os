import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { TaskListSkeleton } from "./TaskListSkeleton";
import { EmptyTaskList } from "./EmptyTaskList";
import { TaskSource } from "@/integrations/supabase/types/tasks";
import { TaskGroup } from "@/components/dashboard/TaskGroup";

interface TaskListProps {
  source?: TaskSource;
  projectId?: string;
  showArchived?: boolean;
}

export const TaskList = ({ source, projectId, showArchived = false }: TaskListProps) => {
  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks", source, projectId, showArchived],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      let query = supabase
        .from("tasks")
        .select(`
          *,
          projects(id, name),
          deals(id, company_name),
          substack_posts(id, title),
          sequences(id, name)
        `)
        .eq('user_id', user.user.id);

      if (source) {
        query = query.eq("source", source);
      }

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (!showArchived) {
        query = query.eq("completed", false);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw new Error("Failed to fetch tasks: " + error.message);
      }

      // Log the tasks for debugging
      console.log("Fetched tasks:", data);

      return data || [];
    },
  });

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task status");
        return;
      }

      toast.success(completed ? "Task marked as complete" : "Task marked as incomplete");
      refetch();
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task status");
    }
  };

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (error) {
    console.error("Task list error:", error);
    return (
      <div className="text-sm text-red-500 p-4 bg-red-50 rounded-lg max-w-3xl">
        Error loading tasks: {error.message || "Please try again"}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyTaskList />;
  }

  // If we're showing tasks by source, group them
  if (source) {
    return (
      <TaskGroup 
        source={source} 
        tasks={tasks}
        onComplete={handleComplete}
      />
    );
  }

  // For the main view, group tasks by source
  const tasksBySource = tasks.reduce((acc: Record<string, any[]>, task) => {
    const source = task.source || 'other';
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(tasksBySource).map(([source, tasks]) => (
        <TaskGroup 
          key={source} 
          source={source} 
          tasks={tasks}
          onComplete={handleComplete}
        />
      ))}
    </div>
  );
};