import { NavLink, useNavigate } from "react-router-dom";
import { Settings2, LogOut, Palette, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SettingsSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear local storage to ensure clean state
      localStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        // Even if there's an error, we want to ensure the user is logged out locally
        navigate("/login", { replace: true });
        if (error.message.includes('session_not_found')) {
          toast.success("You've been signed out successfully");
        } else {
          toast.error("There was an issue with logout, but you've been signed out locally");
        }
        return;
      }

      navigate("/login", { replace: true });
      toast.success("Successfully logged out");
      
    } catch (error) {
      console.error("Logout error:", error);
      // Ensure user is logged out locally even if there's an error
      navigate("/login", { replace: true });
      toast.error("An unexpected error occurred, but you've been signed out locally");
    }
  };

  return (
    <div className="w-64 h-full border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <nav className="space-y-1">
        <NavLink
          to="/dashboard/settings/profile"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Settings2 className="w-5 h-5" />
          <span>Profile Settings</span>
        </NavLink>
        <NavLink
          to="/dashboard/settings/branding"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Palette className="w-5 h-5" />
          <span>Branding</span>
        </NavLink>
        <NavLink
          to="/dashboard/settings/backup"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Shield className="w-5 h-5" />
          <span>Backup & Recovery</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};