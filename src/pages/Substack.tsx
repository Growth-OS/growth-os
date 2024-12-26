import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubstackCalendar } from "@/components/substack/SubstackCalendar";
import { SubstackEditor } from "@/components/substack/SubstackEditor";
import { SubstackKanban } from "@/components/substack/SubstackKanban";
import { CreatePostButton } from "@/components/substack/CreatePostButton";

const Substack = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Newsletter Management</h1>
          <p className="text-gray-600">Plan, write, and manage your Substack newsletter</p>
        </div>
        <CreatePostButton />
      </div>

      <Card className="p-6">
        <Tabs defaultValue="kanban" className="space-y-6">
          <TabsList>
            <TabsTrigger value="kanban">Content Pipeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="m-0">
            <SubstackKanban />
          </TabsContent>

          <TabsContent value="calendar" className="m-0">
            <SubstackCalendar />
          </TabsContent>

          <TabsContent value="drafts" className="m-0">
            <SubstackEditor />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Substack;