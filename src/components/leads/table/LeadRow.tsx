import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadRowProps } from "../types/lead";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const LeadRow = ({
  lead,
  sourceLabels,
  onDelete,
  onEdit,
  isSelected,
  onSelectChange,
}: LeadRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(lead);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(editedLead);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleChange = (field: keyof typeof editedLead, value: string) => {
    setEditedLead(prev => ({ ...prev, [field]: value }));
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
        />
      </TableCell>
      <TableCell>
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedLead.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full"
              />
              <Input
                value={editedLead.company_website || ''}
                onChange={(e) => handleChange('company_website', e.target.value)}
                placeholder="Website"
                className="w-full"
              />
            </div>
          ) : (
            <>
              <p className="font-medium">{lead.company_name}</p>
              {lead.company_website && (
                <a
                  href={lead.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {lead.company_website}
                </a>
              )}
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedLead.first_name || ''}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="First Name"
                className="w-full"
              />
              <Input
                value={editedLead.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="Email"
                className="w-full"
              />
              <Input
                value={editedLead.contact_job_title || ''}
                onChange={(e) => handleChange('contact_job_title', e.target.value)}
                placeholder="Job Title"
                className="w-full"
              />
            </div>
          ) : (
            <>
              {lead.first_name && (
                <p className="font-medium">{lead.first_name}</p>
              )}
              {lead.contact_email && (
                <p className="text-sm text-muted-foreground">{lead.contact_email}</p>
              )}
              {lead.contact_job_title && (
                <p className="text-sm text-muted-foreground">{lead.contact_job_title}</p>
              )}
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        {sourceLabels[lead.source] || lead.source}
      </TableCell>
      <TableCell>
        <span className="capitalize">{lead.status}</span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this lead? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(lead.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};