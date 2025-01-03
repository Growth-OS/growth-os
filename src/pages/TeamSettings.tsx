import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteMemberDialog } from "@/components/settings/team/InviteMemberDialog";
import { TeamMembersList } from "@/components/settings/team/TeamMembersList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TeamSettings = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: team, isError } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // First get the team where the user is an owner
      const { data: teamMember, error: teamMemberError } = await supabase
        .from("team_members")
        .select("team_id, teams(*)")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle(); // Changed from single() to maybeSingle()

      if (teamMemberError) {
        console.error("Error fetching team:", teamMemberError);
        throw teamMemberError;
      }

      if (!teamMember) {
        console.log("No team found for user");
        return null;
      }
      
      return teamMember?.teams;
    },
  });

  if (isError) {
    toast.error("Failed to load team settings");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-left mb-2">Team Settings</h1>
        <p className="text-gray-600 text-left">Manage your team members and permissions</p>
      </div>
      
      {!team ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-600">No team found. Please contact support.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their roles
                </CardDescription>
              </div>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <TeamMembersList teamId={team?.id} />
            </CardContent>
          </Card>

          <InviteMemberDialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            teamId={team?.id}
          />
        </div>
      )}
    </div>
  );
};

export default TeamSettings;