import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createSequenceTasks } from "@/components/sequences/utils/taskCreation";
import type { Prospect } from "../types/prospect";

interface AssignSequenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect;
}

export const AssignSequenceDialog = ({ open, onOpenChange, prospect }: AssignSequenceDialogProps) => {
  const [selectedSequence, setSelectedSequence] = useState<string>("");

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ['sequences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('sequences')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching sequences:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleAssignToSequence = async () => {
    try {
      if (!selectedSequence) {
        toast.error('Please select a sequence');
        return;
      }

      // Check if prospect is already assigned to this sequence
      const { data: existingAssignment, error: checkError } = await supabase
        .from('sequence_assignments')
        .select('id')
        .eq('sequence_id', selectedSequence)
        .eq('prospect_id', prospect.id)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAssignment) {
        toast.error('Prospect is already assigned to this sequence');
        return;
      }

      // Get sequence details and steps
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('sequences')
        .select(`
          *,
          sequence_steps (*)
        `)
        .eq('id', selectedSequence)
        .single();

      if (sequenceError) throw sequenceError;

      // Create the sequence assignment
      const { data: assignment, error: insertError } = await supabase
        .from('sequence_assignments')
        .insert([{
          sequence_id: selectedSequence,
          prospect_id: prospect.id,
          current_step: 1,
          status: 'active'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create tasks using the utility function
      const tasks = createSequenceTasks(
        sequenceData.sequence_steps,
        prospect,
        user.id
      );

      // Insert all tasks
      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasks);

        if (tasksError) {
          console.error('Error creating tasks:', tasksError);
          throw tasksError;
        }
      }

      toast.success('Prospect assigned to sequence successfully');
      onOpenChange(false);
      setSelectedSequence("");
    } catch (error) {
      console.error('Error assigning prospect to sequence:', error);
      toast.error('Error assigning prospect to sequence');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setSelectedSequence("");
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign to Sequence</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div>Loading sequences...</div>
          ) : sequences.length === 0 ? (
            <div className="text-center text-gray-500">
              No active sequences found. Please create a sequence first.
            </div>
          ) : (
            <Select value={selectedSequence} onValueChange={setSelectedSequence}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sequence" />
              </SelectTrigger>
              <SelectContent>
                {sequences.map((sequence) => (
                  <SelectItem key={sequence.id} value={sequence.id}>
                    {sequence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button 
            onClick={handleAssignToSequence} 
            disabled={!selectedSequence || isLoading}
            className="w-full"
          >
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};