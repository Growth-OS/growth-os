import React from "react";
import { useLocation } from "react-router-dom";
import { Home, Calendar, Edit, ListTodo, Users, ChartBar, BookOpen, Briefcase, UserPlus, Euro, FolderOpen, Mail, Linkedin } from "lucide-react";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SidebarNavigation = () => {
  const location = useLocation();
  
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadEmails'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_trashed', false)
        .eq('is_archived', false);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const mainMenuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
    { icon: UserPlus, label: "Prospects", path: "/dashboard/prospects" },
    { icon: Briefcase, label: "Deals", path: "/dashboard/deals" },
    { icon: FolderOpen, label: "Projects", path: "/dashboard/projects" },
    { icon: ListTodo, label: "Tasks", path: "/dashboard/tasks" },
    { icon: BookOpen, label: "Substack", path: "/dashboard/substack" },
    { icon: Users, label: "Affiliates", path: "/dashboard/affiliates" },
    { icon: Euro, label: "Finances", path: "/dashboard/finances" },
    { icon: ChartBar, label: "Reporting", path: "/dashboard/reporting" },
  ];

  const communicationItems = [
    { 
      icon: Mail, 
      label: "Email", 
      path: "/dashboard/inbox/email",
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { 
      icon: Linkedin, 
      label: "LinkedIn", 
      path: "/dashboard/inbox/linkedin"
    },
  ];

  const betaFeatures = [
    { 
      icon: Edit,
      label: "LinkedIn Content",
      path: "/dashboard/content",
      beta: true
    }
  ];

  return (
    <>
      <nav className="space-y-1 flex-1">
        <div className="mb-6">
          {mainMenuItems.map((item) => (
            <SidebarMenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>

        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase">
            Communication
          </div>
          {communicationItems.map((item) => (
            <SidebarMenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname.includes(item.path)}
              badge={item.badge}
            />
          ))}
        </div>
      </nav>

      <div className="pt-4 border-t border-gray-200">
        <div className="mb-4 space-y-1">
          {betaFeatures.map((item) => (
            <SidebarMenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
              beta={item.beta}
            />
          ))}
        </div>
      </div>
    </>
  );
};