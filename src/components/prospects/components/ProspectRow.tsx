import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Prospect } from "../types/prospect";

interface ProspectRowProps {
  prospect: Prospect;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
}

export const ProspectRow = ({
  prospect,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ProspectRowProps) => {
  return (
    <tr key={prospect.id} className="hover:bg-muted/50">
      <td className="p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(prospect.id)}
        />
      </td>
      <td className="p-4 font-medium">{prospect.company_name}</td>
      <td className="p-4 text-muted-foreground">{prospect.contact_email}</td>
      <td className="p-4 text-muted-foreground">{prospect.contact_job_title}</td>
      <td className="p-4 text-muted-foreground">{prospect.source}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(prospect)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(prospect.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
};