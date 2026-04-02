import {
  LayoutDashboard, Briefcase, Users, CalendarCheck, UserPlus, Building2,
  Shield, UserCheck, Wallet, CalendarDays, BarChart3, Settings, LogOut, Mail,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth, roleAccess } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navGroups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
      { title: "Inbox", url: "/inbox", icon: Mail, key: "inbox" },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { title: "Recruitment", url: "/recruitment", icon: Briefcase, key: "recruitment" },
      { title: "Candidates", url: "/candidates", icon: Users, key: "candidates" },
      { title: "Interviews", url: "/interviews", icon: CalendarCheck, key: "interviews" },
      { title: "Onboarding", url: "/onboarding", icon: UserPlus, key: "onboarding" },
    ],
  },
  {
    label: "Staff",
    items: [
      { title: "Employees", url: "/employees", icon: Users, key: "employees" },
      { title: "Departments", url: "/departments", icon: Building2, key: "departments" },
      { title: "Roles & Permissions", url: "/roles", icon: Shield, key: "roles" },
      { title: "Guarantors", url: "/guarantors", icon: UserCheck, key: "guarantors" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Payroll", url: "/payroll", icon: Wallet, key: "payroll" },
      { title: "Leave Management", url: "/leave", icon: CalendarDays, key: "leave" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3, key: "reports" },
      { title: "Settings", url: "/settings", icon: Settings, key: "settings" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout, messages } = useAuth();
  const currentPath = location.pathname;
  const allowedKeys = user ? roleAccess[user.role] : [];
  const unreadMessages = messages.filter((m) => m.type === "inbox" && !m.read).length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Target Pathology" className="h-10 w-10 rounded object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground leading-tight">Target Pathology</span>
              <span className="text-[10px] text-muted-foreground">HR Module</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => allowedKeys.includes(item.key));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-4">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={currentPath === item.url}>
                        <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && (
                            <span className="flex items-center gap-2">
                              {item.title}
                              {item.key === "inbox" && unreadMessages > 0 && (
                                <Badge variant="default" className="h-4 px-1.5 text-[10px]">{unreadMessages}</Badge>
                              )}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
