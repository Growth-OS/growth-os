import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
}

export const InviteMemberDialog = ({ open, onOpenChange, teamId }: InviteMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Invite submission started"); // Debug log

    if (!teamId) {
      toast.error("No team selected");
      return;
    }

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    console.log("Loading state set to true"); // Debug log

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Auth check result:", { user, authError }); // Debug log
      
      if (authError || !user) {
        throw new Error(authError?.message || "Not authenticated");
      }

      // Get inviter's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .single();

      console.log("Profile fetch result:", { profile, profileError }); // Debug log

      if (profileError) {
        throw new Error("Error fetching user profile");
      }

      // Check if user already exists
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      console.log("Existing profile check:", { existingProfile, existingProfileError }); // Debug log

      if (existingProfileError && existingProfileError.code !== 'PGRST116') {
        throw new Error("Error checking existing user");
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Create invitation record
      const { error: inviteError } = await supabase
        .from("team_invitations")
        .insert({
          team_id: teamId,
          email,
          role,
          invited_by: user.id,
          token,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        });

      console.log("Invitation creation result:", { inviteError }); // Debug log

      if (inviteError) {
        throw new Error("Failed to create invitation");
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          teamId,
          role,
          invitedBy: profile.full_name || user.email,
          token
        },
      });

      console.log("Email sending result:", { emailError }); // Debug log

      if (emailError) {
        throw new Error("Failed to send invitation email");
      }

      toast.success("Team member invited successfully");
      onOpenChange(false);
      setEmail("");
      setRole("member");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite team member");
    } finally {
      setIsLoading(false);
      console.log("Loading state set to false"); // Debug log
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as "admin" | "member")}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inviting...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};