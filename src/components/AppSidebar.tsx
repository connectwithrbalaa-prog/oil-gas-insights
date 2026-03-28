import {
  LayoutDashboard,
  Search,
  Network,
  AlertTriangle,
  Gauge,
  Radio,
  ShieldAlert,
  BarChart3,
  Activity,
  Wrench,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "RCA Runs", url: "/rca-runs", icon: Search },
  { title: "Equipment", url: "/equipment", icon: Network },
  { title: "Failure Events", url: "/failure-events", icon: AlertTriangle },
];

const analysisItems = [
  { title: "Asset Risk", url: "/bad-actors", icon: ShieldAlert },
  { title: "RCA Outcomes", url: "/rca-outcomes", icon: BarChart3 },
  { title: "Signals", url: "/signals", icon: Activity },
  { title: "PM Proposals", url: "/pm-proposals", icon: Wrench },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success status-indicator animate-pulse-glow" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-display font-semibold tracking-wider text-foreground">
                MAINT<span className="text-primary">AI</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Intelligence Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 mb-1">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
                        activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                        {isActive && !collapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary status-indicator" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 mb-1">
            Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
                        activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                        {isActive && !collapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary status-indicator" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                JR
              </div>
              <div>
                <p className="text-[11px] font-medium text-foreground">J. Rodriguez</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Operations Lead</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Radio className="w-3 h-3 text-success animate-pulse-glow" />
              <span className="uppercase tracking-wider">System Online</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
              JR
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
