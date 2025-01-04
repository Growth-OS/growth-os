import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AssignSequenceDialog } from "./AssignSequenceDialog";
import { useState } from "react";

interface BulkActionsProps {
  selectedIds: string[];
  allSelected: boolean;
  onSelectAll: () => void;
  onAssignSequence: (sequenceId: string) => Promise<void>;
}

export const BulkActions = ({
  selectedIds,
  allSelected,
  onSelectAll,
  onAssignSequence,
}: BulkActionsProps) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 py-4">
      <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
      <Button
        variant="outline"
        size="sm"
        disabled={selectedIds.length === 0}
        onClick={() => setIsAssignDialogOpen(true)}
      >
        Assign to Sequence
      </Button>
      <AssignSequenceDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssign={onAssignSequence}
      />
    </div>
  );
};