import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSequenceTaskOperations } from "./useSequenceTaskOperations";

export const useSequenceOperations = () => {
  const queryClient = useQueryClient();
  const { createSequenceTasks } = useSequenceTaskOperations();

  const deleteMutation = useMutation({
    mutationFn: async ({ sequenceId, sequenceName }: { sequenceId: string, sequenceName: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Update tasks to completed instead of deleting them
      const { error: tasksError } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq('user_id', user.user.id)
        .like('title', `%sequence "${sequenceName}"%`);

      if (tasksError) throw tasksError;

      // Soft delete the sequence instead of hard deleting
      const { error: sequenceError } = await supabase
        .from("sequences")
        .update({ 
          is_deleted: true,
          status: 'completed' 
        })
        .eq("id", sequenceId);

      if (sequenceError) throw sequenceError;

      // Update assignments to completed
      const { error: assignmentsError } = await supabase
        .from("sequence_assignments")
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq("sequence_id", sequenceId);

      if (assignmentsError) throw assignmentsError;

      return { sequenceId, sequenceName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      toast.success("Sequence deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting sequence:", error);
      toast.error("Failed to delete sequence");
    }
  });

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

      // Check if prospect is already assigned to this sequence
      const { data: existingAssignment } = await supabase
        .from("sequence_assignments")
        .select("*")
        .eq("sequence_id", sequenceId)
        .eq("prospect_id", prospectId)
        .maybeSingle();

      if (existingAssignment) {
        throw new Error("Prospect is already assigned to this sequence");
      }

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

      console.log("Creating tasks for sequence:", sequence.name);
      console.log("Steps:", sequence.sequence_steps);
      console.log("Prospect:", prospect);

      // Create tasks for each step
      await createSequenceTasks(sequence.id, prospectId, sequence.sequence_steps, prospect, user);

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
      if (error instanceof Error && error.message === "Prospect is already assigned to this sequence") {
        toast.error("This prospect is already assigned to this sequence");
      } else {
        toast.error("Failed to assign prospect to sequence");
      }
    }
  });

  return {
    deleteSequence: (sequenceId: string, sequenceName: string) => 
      deleteMutation.mutateAsync({ sequenceId, sequenceName }),
    assignProspect: assignProspectMutation.mutate,
    isAssigning: assignProspectMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};