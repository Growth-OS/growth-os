import { TableCell, TableRow } from "@/components/ui/table";
import { ProspectActions } from "./ProspectActions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLinks } from "./components/ExternalLinks";
import type { Prospect } from "./types/prospect";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ProspectRowProps {
  prospect: Prospect;
  sourceLabels: Record<string, string>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (prospect: any) => void;
  onConvertToLead: (prospect: Prospect) => Promise<void>;
  onConvertToSequence?: (prospect: Prospect) => void;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
}

export const ProspectRow = ({ 
  prospect, 
  sourceLabels, 
  onDelete, 
  onEdit,
  onConvertToLead,
  onConvertToSequence,
  isSelected,
  onSelectChange
}: ProspectRowProps) => {
  const getStatusBadgeVariant = (status: string | undefined, isConverted: boolean | undefined) => {
    if (status === 'converted' || isConverted) return 'secondary';
    if (status === 'in_sequence') return 'default';
    return 'outline';
  };

  const getStatusText = () => {
    if (prospect.status === 'converted' || prospect.is_converted_to_deal) return 'Converted to Lead';
    if (prospect.status === 'in_sequence') return `In Sequence${prospect.sequence_name ? `: ${prospect.sequence_name}` : ''}`;
    if (prospect.status === 'completed_sequence') return 'Sequence Completed';
    return 'Active';
  };

  const handleConvertToLead = async () => {
    try {
      console.log('Converting prospect to lead:', prospect.id);
      await onConvertToLead(prospect);
      toast.success("Prospect successfully converted to a lead");
    } catch (error) {
      console.error('Error converting prospect:', error);
      toast.error("Failed to convert prospect to lead");
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="p-4 text-left">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
        />
      </TableCell>
      <TableCell className="p-4 text-left font-medium">{prospect.company_name}</TableCell>
      <TableCell className="p-4 text-left">
        <Badge variant="outline" className="text-left">
          {sourceLabels[prospect.source]}
        </Badge>
      </TableCell>
      <TableCell className="p-4 text-left">{prospect.contact_job_title || '-'}</TableCell>
      <TableCell className="p-4 text-left">{prospect.contact_email || '-'}</TableCell>
      <TableCell className="p-4 text-left">
        <ExternalLinks 
          website={prospect.company_website} 
          linkedin={prospect.contact_linkedin}
        />
      </TableCell>
      <TableCell className="p-4 text-left">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant={getStatusBadgeVariant(prospect.status, prospect.is_converted_to_deal)}
                className={prospect.status === 'in_sequence' ? 'bg-blue-100 text-blue-800' : ''}
              >
                {getStatusText()}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {prospect.status === 'in_sequence' && prospect.current_step 
                ? `Current Step: ${prospect.current_step}`
                : getStatusText()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="p-4 text-left">
        <ProspectActions
          prospect={prospect}
          onDelete={onDelete}
          onEdit={onEdit}
          onConvertToLead={handleConvertToLead}
          onConvertToSequence={onConvertToSequence}
        />
      </TableCell>
    </TableRow>
  );
};