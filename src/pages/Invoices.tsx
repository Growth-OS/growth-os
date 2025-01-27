import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Invoices = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const overdueAmount = filteredInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-lg bg-[#161e2c] border border-gray-800/40 shadow-sm">
        <div className="relative z-10 px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left">
              <h1 className="text-2xl font-medium text-white">Invoices</h1>
              <p className="text-sm text-gray-300 mt-1">
                Create and manage your invoices efficiently
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-white hover:bg-white/90 text-black transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
            <div className="text-2xl font-bold mt-2">€{(totalAmount - paidAmount).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-2xl font-bold mt-2 text-green-600">€{paidAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Overdue Amount</div>
            <div className="text-2xl font-bold mt-2 text-red-600">€{overdueAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <InvoicesTable invoices={filteredInvoices} />
      )}

      <CreateInvoiceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default Invoices;