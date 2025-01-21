import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { InvoiceFormFields } from "./form/InvoiceFormFields";

interface InvoiceFormData {
  company_name: string;
  company_address?: string;
  company_email?: string;
  company_vat_code?: string;
  company_code?: string;
  client_name: string;
  client_address?: string;
  client_email?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  notes?: string;
  payment_terms?: string;
  deal_id?: string;
}

interface CreateInvoiceFormProps {
  onSuccess?: () => void;
  onDataChange?: (data: InvoiceFormData) => void;
}

const calculateTotals = (data: InvoiceFormData): InvoiceFormData => {
  const subtotal = data.subtotal || 0;
  const taxRate = data.tax_rate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    ...data,
    tax_amount: taxAmount,
    total: total
  };
};

export const CreateInvoiceForm = ({ onSuccess, onDataChange }: CreateInvoiceFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<InvoiceFormData>({
    defaultValues: {
      status: 'draft',
      company_name: "Prospect Labs UAB",
      company_address: "Verkiu g. 31B2\nLT09108 Vilnius\nLithuania\nCompany Number: LT100012926716",
      company_vat_code: "",
      company_code: "",
      payment_terms: "Bank: Revolut\nBank Address: 09108, Verkiu 31B2, Laisves Namai, Vilnius, Lithuania\nAccount Holder: UAB Prospect Labs\nIBAN Number: LT81 3250 0549 4897 7554\nSwift / BIC: REVOLT21\nIntermediary BIC: BARCGB22"
    },
  });

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (onDataChange && data.invoice_number) {
        const calculatedData = calculateTotals(data as InvoiceFormData);
        onDataChange(calculatedData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onDataChange]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create an invoice');
        return;
      }

      const { error } = await supabase
        .from('invoices')
        .insert({
          ...data,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Error creating invoice');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InvoiceFormFields form={form} />
        <Button type="submit" className="w-full">
          Create Invoice
        </Button>
      </form>
    </Form>
  );
};