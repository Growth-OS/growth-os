import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { TaskSource } from "@/integrations/supabase/types/tasks";
import { mapDbStepTypeToFrontend } from "../utils/stepTypeMapping";

export const useSequenceOperations = () => {
  const queryClient = useQueryClient();

  const deleteSequence = async (sequenceId: string, sequenceName: string) => {
    try {
      // Delete all tasks associated with this sequence
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq('user_id', user.user.id)
        .like('title', `%sequence "${sequenceName}"%`);

      if (tasksError) throw tasksError;

      // Delete the sequence
      const { error: sequenceError } = await supabase
        .from("sequences")
        .delete()
        .eq("id", sequenceId);

      if (sequenceError) throw sequenceError;

      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      toast.success("Sequence deleted successfully");
    } catch (error) {
      console.error("Error deleting sequence:", error);
      toast.error("Failed to delete sequence");
    }
  };

  const assignProspectMutation = useMutation({
    mutationFn: async ({ 
      sequenceId, 
      prospectId 
    }: { 
      sequenceId: string; 
      prospectId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, get the sequence details and steps
      const { data: sequence, error: sequenceError } = await supabase
        .from("sequences")
        .select(`
          *,
          sequence_steps (*)
        `)
        .eq("id", sequenceId)
        .single();

      if (sequenceError) throw sequenceError;

      // Get prospect details
      const { data: prospect, error: prospectError } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", prospectId)
        .single();

      if (prospectError) throw prospectError;

      // Create the sequence assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("sequence_assignments")
        .insert({
          sequence_id: sequenceId,
          prospect_id: prospectId,
          status: "active",
          current_step: 1
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create tasks for each step
      const tasks = sequence.sequence_steps.map(step => {
        const dueDate = addDays(new Date(), step.delay_days || 0);
        const stepType = mapDbStepTypeToFrontend(step.step_type, step.step_number);
        const actionType = stepType.startsWith('email') ? 'Send email' : 
                          stepType === 'linkedin_connection' ? 'Send LinkedIn connection request' : 
                          'Send LinkedIn message';
        
        const contactMethod = stepType.startsWith('email') ? 
          `(${prospect.contact_email})` : 
          `(${prospect.contact_linkedin})`;

        return {
          title: `${actionType} to ${prospect.company_name} - ${prospect.contact_job_title} ${contactMethod} - Step ${step.step_number}`,
          description: step.message_template,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          source: 'other' as TaskSource,
          priority: 'medium',
          user_id: user.id
        };
      });

      // Insert all tasks
      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from("tasks")
          .insert(tasks);

        if (tasksError) {
          console.error("Error creating tasks:", tasksError);
          throw tasksError;
        }
      }

      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-tasks"] });
      toast.success("Prospect assigned to sequence successfully");
    },
    onError: (error) => {
      console.error("Error assigning prospect:", error);
      toast.error("Failed to assign prospect to sequence");
    }
  });

  return {
    deleteSequence,
    assignProspect: assignProspectMutation.mutate,
    isAssigning: assignProspectMutation.isPending,
  };
};