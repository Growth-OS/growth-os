import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyFields } from "./form-fields/CompanyFields";
import { ContactFields } from "./form-fields/ContactFields";
import { SourceField } from "./form-fields/SourceField";
import { NotesField } from "./form-fields/NotesField";

const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_website: z.string().url().optional().or(z.literal("")),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_job_title: z.string().optional(),
  contact_linkedin: z.string().url().optional().or(z.literal("")),
  source: z.enum(['website', 'referral', 'linkedin', 'cold_outreach', 'conference', 'other']),
  notes: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
});

interface CreateLeadFormProps {
  onSuccess: () => void;
}

export const CreateLeadForm = ({ onSuccess }: CreateLeadFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: 'other',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add leads');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert({
          ...values,
          user_id: user.id,
          status: 'new'
        });

      if (error) throw error;

      toast.success('Lead added successfully');
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CompanyFields form={form} />
        <ContactFields form={form} />
        <SourceField form={form} />
        <NotesField form={form} />
        <Button type="submit" className="w-full">Add Lead</Button>
      </form>
    </Form>
  );
};