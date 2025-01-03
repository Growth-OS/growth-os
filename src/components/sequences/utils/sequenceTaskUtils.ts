import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { DatabaseStepType, StepType } from "../types";
import { mapDbStepTypeToFrontend } from "./stepTypeMapping";

export const updateSequenceProgress = async (taskId: string, tasks: any[]) => {
  const task = tasks?.find(t => t.id === taskId);
  if (!task || task.source !== 'other' || !task.title.includes('sequence')) {
    return;
  }

  const sequenceName = task.title.match(/sequence "([^"]+)"/)?.[1];
  if (!sequenceName) return;

  // Get the sequence
  const { data: sequences } = await supabase
    .from('sequences')
    .select('id')
    .eq('name', sequenceName)
    .maybeSingle();

  if (!sequences) return;

  // Get all assignments for this sequence
  const { data: assignments } = await supabase
    .from('sequence_assignments')
    .select(`
      *,
      sequence:sequences(
        id,
        sequence_steps(*)
      )
    `)
    .eq('sequence_id', sequences.id);

  if (!assignments || assignments.length === 0) return;

  // Update each assignment
  const updatePromises = assignments.map(async (assignment) => {
    const nextStep = assignment.current_step + 1;
    const steps = assignment.sequence.sequence_steps;
    
    // Find the next step's delay_days
    const nextStepData = steps.find(s => s.step_number === nextStep);
    
    // Calculate the due date based on when the sequence started
    const { data: assignmentData } = await supabase
      .from('sequence_assignments')
      .select('created_at')
      .eq('id', assignment.id)
      .maybeSingle();
      
    const sequenceStartDate = assignmentData?.created_at ? new Date(assignmentData.created_at) : new Date();
    const dueDate = nextStepData 
      ? addDays(sequenceStartDate, nextStepData.delay_days || 0).toISOString()
      : null;

    // Update the assignment
    await supabase
      .from('sequence_assignments')
      .update({ 
        current_step: nextStep,
        status: nextStep >= steps.length ? 'completed' : 'active'
      })
      .eq('id', assignment.id);

    // Create next task if there is one
    if (nextStepData) {
      await createNextSequenceTask(sequenceName, nextStep, nextStepData, dueDate);
    }
  });

  await Promise.all(updatePromises);
};

export const deleteSequenceTasks = async (sequenceName: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  // Delete all tasks associated with this sequence
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq('user_id', user.user.id)
    .like('title', `%sequence "${sequenceName}"%`);

  if (error) {
    console.error("Error deleting sequence tasks:", error);
    throw error;
  }
};

const createNextSequenceTask = async (
  sequenceName: string,
  stepNumber: number,
  stepData: { step_type: DatabaseStepType; message_template: string | null; delay_days: number },
  dueDate: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const frontendStepType = mapDbStepTypeToFrontend(stepData.step_type, stepNumber);
  const actionType = getActionTypeForStep(frontendStepType);

  await supabase
    .from("tasks")
    .insert({
      title: `${actionType} for sequence "${sequenceName}" - Step ${stepNumber}`,
      description: stepData.message_template,
      due_date: dueDate,
      source: 'other',
      priority: 'medium',
      user_id: user.id
    });
};

const getActionTypeForStep = (stepType: StepType): string => {
  if (stepType.startsWith('email')) {
    return 'Send email';
  } else if (stepType === 'linkedin_connection') {
    return 'Send LinkedIn connection request';
  } else {
    return 'Send LinkedIn message';
  }
};