import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { TaskList } from "@/components/tasks/TaskList";

export const ProjectTasks = ({ projectId }: { projectId: string }) => {
  return (
    <div className="space-y-6">
      <CreateTaskForm sourceId={projectId} source="projects" />
      <TaskList source="projects" />
    </div>
  );
};