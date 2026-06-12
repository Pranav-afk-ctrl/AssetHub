import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Shield,
  Boxes,
  CheckSquare,
  Truck,
  History,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", url: "/assets", icon: Package },
  { title: "My Bookings", url: "/my-bookings", icon: ClipboardList },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin/dashboard", icon: Shield },
  { title: "Manage Assets", url: "/admin/assets", icon: Boxes },
  { title: "Approvals", url: "/admin/bookings", icon: CheckSquare },
  { title: "Allocations", url: "/admin/allocations", icon: Truck },
  { title: "Activity Log", url: "/admin/activity", icon: History },
];

export function AppSidebar() {
  const { role, user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => path === p;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">AssetHub</span>
            <span className="text-xs text-muted-foreground">Resource Mgmt</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)}>
                    <Link to={i.url} className="flex items-center gap-2">
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((i) => (
                  <SidebarMenuItem key={i.url}>
                    <SidebarMenuButton asChild isActive={isActive(i.url)}>
                      <Link to={i.url} className="flex items-center gap-2">
                        <i.icon className="h-4 w-4" />
                        <span>{i.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full">
            <LogOut className="h-3 w-3 mr-2" /> Sign out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}