import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ProjectFormFields } from "../form/ProjectFormFields";
import { ProjectDateFields } from "../form/ProjectDateFields";
import { ProjectBudgetField } from "../form/ProjectBudgetField";
import { ProjectFormData } from "../form/types";

interface Project {
  id: string;
  name: string;
  client_name: string;
  description?: string;
  status: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetails = ({ project, onClose }: ProjectDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<ProjectFormData>({
    defaultValues: {
      name: project.name,
      client_name: project.client_name,
      description: project.description,
      status: project.status as 'active' | 'completed' | 'on_hold',
      budget: project.budget,
      start_date: project.start_date ? new Date(project.start_date) : undefined,
      end_date: project.end_date ? new Date(project.end_date) : undefined,
    },
  });

  const handleUpdate = async (data: ProjectFormData) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          ...data,
          start_date: data.start_date?.toISOString().split("T")[0],
          end_date: data.end_date?.toISOString().split("T")[0],
        })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project updated successfully");
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Project
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Project</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid gap-4">
          <div>
            <h3 className="font-medium">Project Name</h3>
            <p>{project.name}</p>
          </div>
          <div>
            <h3 className="font-medium">Client Name</h3>
            <p>{project.client_name}</p>
          </div>
          {project.description && (
            <div>
              <h3 className="font-medium">Description</h3>
              <p>{project.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium">Status</h3>
            <p className="capitalize">{project.status}</p>
          </div>
          {project.budget && (
            <div>
              <h3 className="font-medium">Budget</h3>
              <p>${project.budget.toLocaleString()}</p>
            </div>
          )}
          {(project.start_date || project.end_date) && (
            <div>
              <h3 className="font-medium">Timeline</h3>
              <p>
                {project.start_date && (
                  <>Start: {new Date(project.start_date).toLocaleDateString()}</>
                )}
                {project.end_date && (
                  <>
                    {" "}
                    - End: {new Date(project.end_date).toLocaleDateString()}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
        <ProjectFormFields form={form} />
        <ProjectDateFields form={form} />
        <ProjectBudgetField form={form} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
};