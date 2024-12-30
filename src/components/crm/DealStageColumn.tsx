import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Droppable } from "@hello-pangea/dnd";
import { Draggable } from "@hello-pangea/dnd";
import { DealCard } from "./DealCard";
import { Deal } from "@/integrations/supabase/types/deals";

interface DealStageColumnProps {
  stage: {
    id: string;
    label: string;
  };
  deals: Deal[];
  onEdit: (deal: Deal) => void;
}

export const DealStageColumn = ({ stage, deals, onEdit }: DealStageColumnProps) => {
  const stageDeals = deals.filter(deal => deal.stage === stage.id);
  const totalValue = stageDeals.reduce((sum, deal) => sum + Number(deal.deal_value), 0);

  return (
    <div className="flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-w-[320px] max-w-[320px]">
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{stage.label}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-[#E3F2FD] text-[#1EAEDB] font-medium">
            {stageDeals.length}
          </span>
        </div>
        <span className="text-xs font-medium text-[#1EAEDB]">
          ${totalValue.toLocaleString()}
        </span>
      </div>
      <Droppable droppableId={stage.id}>
        {(provided) => (
          <ScrollArea className="flex-1 p-2">
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {stageDeals.map((deal, index) => (
                <Draggable 
                  key={deal.id} 
                  draggableId={deal.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <DealCard deal={deal} onEdit={onEdit} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {stageDeals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                  <p>No deals in this stage</p>
                  <p className="text-xs mt-1">Drag deals here or create a new one</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
};