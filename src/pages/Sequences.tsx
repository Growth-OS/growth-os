import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SequenceStats } from "@/components/sequences/SequenceStats";
import { SequencesList } from "@/components/sequences/SequencesList";
import { CreateSequenceButton } from "@/components/sequences/CreateSequenceButton";
import type { Sequence } from "@/components/sequences/types";

const Sequences = () => {
  const { data: sequences, isLoading, error } = useQuery({
    queryKey: ["sequences"],
    queryFn: async () => {
      console.log('Fetching sequences...');
      const { data, error } = await supabase
        .from("sequences")
        .select(`
          *,
          sequence_steps (
            count
          ),
          sequence_assignments (
            id,
            status,
            current_step,
            prospect: prospects (
              company_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching sequences:', error);
        throw error;
      }

      console.log('Sequences fetched:', data);
      return data as unknown as Sequence[];
    },
  });

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading sequences. Please try again.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sequences</h1>
          <p className="text-muted-foreground">
            Create and manage your outreach sequences
          </p>
        </div>
        <CreateSequenceButton />
      </div>

      <SequenceStats sequences={sequences || []} />
      <SequencesList sequences={sequences || []} isLoading={isLoading} />
    </div>
  );
};

export default Sequences;