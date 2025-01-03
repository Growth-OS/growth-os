import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { AddStepDialog } from "@/components/sequences/AddStepDialog";
import { SequenceStepsList } from "@/components/sequences/SequenceStepsList";
import { useState } from "react";
import { useSequenceSteps } from "@/components/sequences/hooks/useSequenceSteps";
import { StepType, SequenceStep } from "@/components/sequences/types";

const SequenceBuilder = () => {
  const { sequenceId } = useParams();
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  
  const { 
    sequence, 
    isLoading, 
    addStep, 
    isAddingStep 
  } = useSequenceSteps(sequenceId!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sequence) {
    return <div>Sequence not found</div>;
  }

  const handleAddStep = (values: {
    step_type: StepType;
    message_template: string;
    delay_days: number;
  }) => {
    addStep(values);
    setIsAddStepOpen(false);
  };

  // Convert DatabaseSequenceStep[] to SequenceStep[]
  const steps: SequenceStep[] = sequence.sequence_steps?.map(step => ({
    id: step.id,
    step_number: step.step_number,
    step_type: step.step_type as StepType,
    message_template: step.message_template || "",
    delay_days: step.delay_days || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/sequences">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sequences
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{sequence.name}</h1>
          <p className="text-muted-foreground">{sequence.description}</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sequence Steps</h2>
          <Button 
            onClick={() => setIsAddStepOpen(true)}
            disabled={isAddingStep}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <SequenceStepsList steps={steps} />

        <AddStepDialog
          open={isAddStepOpen}
          onOpenChange={setIsAddStepOpen}
          onSubmit={handleAddStep}
        />
      </div>
    </div>
  );
};

export default SequenceBuilder;