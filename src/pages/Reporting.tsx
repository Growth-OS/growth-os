import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TotalDealValueCard } from "@/components/reporting/TotalDealValueCard";
import { DealStageConversions } from "@/components/reporting/DealStageConversions";
import { LeadsChartSection } from "@/components/reporting/LeadsChartSection";
import { MonthlyChartsSection } from "@/components/reporting/MonthlyChartsSection";
import { ModuleFilter } from "@/components/reporting/ModuleFilter";
import { FinancialReporting } from "@/components/reporting/FinancialReporting";
import { useState } from "react";
import { ChartBarIcon } from "lucide-react";

const Reporting = () => {
  const [selectedModule, setSelectedModule] = useState("all");

  const { data: earnings } = useQuery({
    queryKey: ['affiliateEarnings'],
    queryFn: async () => {
      if (selectedModule !== 'all' && selectedModule !== 'affiliate') return [];
      
      const { data, error } = await supabase
        .from('affiliate_earnings')
        .select('amount, date')
        .order('date');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: deals } = useQuery({
    queryKey: ['deals', selectedModule],
    queryFn: async () => {
      if (selectedModule !== 'all' && selectedModule !== 'deals') return [];

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .in('stage', ['lead', 'meeting', 'negotiation', 'project_preparation', 'in_progress']);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects', selectedModule],
    queryFn: async () => {
      if (selectedModule !== 'all' && selectedModule !== 'prospects') return [];

      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const totalDealValue = deals?.reduce((sum, deal) => sum + Number(deal.deal_value), 0) || 0;

  const shouldShowDeals = selectedModule === 'all' || selectedModule === 'deals';
  const shouldShowProspects = selectedModule === 'all' || selectedModule === 'prospects';
  const shouldShowAffiliates = selectedModule === 'all' || selectedModule === 'affiliate';
  const shouldShowFinances = selectedModule === 'all' || selectedModule === 'finances';

  return (
    <div className="space-y-6 animate-fade-in p-6 bg-[#FAFAFA] dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Reporting Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track and analyse your business metrics
          </p>
        </div>
        <ModuleFilter 
          value={selectedModule} 
          onChange={setSelectedModule} 
        />
      </div>

      <div className="grid gap-6">
        {shouldShowDeals && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TotalDealValueCard totalDealValue={totalDealValue} />
            <DealStageConversions />
          </div>
        )}

        {shouldShowProspects && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <LeadsChartSection prospects={prospects} />
          </div>
        )}
        
        {shouldShowAffiliates && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <MonthlyChartsSection 
              prospects={prospects}
              earnings={earnings || []}
            />
          </div>
        )}

        {shouldShowFinances && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <FinancialReporting />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reporting;