import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bug, Lightbulb, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateDevelopmentItemForm } from "@/components/development/CreateDevelopmentItemForm";

const Development = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ["development-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("development_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch development items");
        throw error;
      }

      return data;
    },
  });

  const filteredItems = items?.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const renderPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <ArrowUpCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Development</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track ideas and areas for Growth OS development
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Development Item</DialogTitle>
            </DialogHeader>
            <CreateDevelopmentItemForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="idea">
              <Lightbulb className="w-4 h-4 mr-2" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="bug">
              <Bug className="w-4 h-4 mr-2" />
              Bugs
            </TabsTrigger>
            <TabsTrigger value="feature">Features</TabsTrigger>
            <TabsTrigger value="improvement">Improvements</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredItems?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items found. Add your first development item!
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems?.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          {renderPriorityIcon(item.priority)}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default Development;