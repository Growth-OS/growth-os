import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DealFormFields } from "./form-fields/DealFormFields";
import { DealFormData } from "./types";

interface CreateDealFormProps {
  onSuccess: () => void;
  initialData?: DealFormData & { id: string };
}

export const CreateDealForm = ({ onSuccess, initialData }: CreateDealFormProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<DealFormData>({
    defaultValues: initialData || {
      stage: 'lead'
    }
  });

  const onSubmit = async (data: DealFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a deal');
        return;
      }

      if (initialData?.id) {
        const { error } = await supabase
          .from('deals')
          .update({
            ...data,
            deal_value: Number(data.deal_value),
            last_activity_date: new Date().toISOString()
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Deal updated successfully');
      } else {
        const { error } = await supabase
          .from('deals')
          .insert({
            ...data,
            deal_value: Number(data.deal_value),
            user_id: user.id,
          });

        if (error) throw error;
        toast.success('Deal created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onSuccess();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Error saving deal');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DealFormFields register={register} setValue={setValue} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {initialData ? 'Update Deal' : 'Create Deal'}
      </Button>
    </form>
  );
};