import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/60 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
              <div className="h-4 w-px bg-border" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
                Maintenance Intelligence Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button className="relative p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto grid-bg">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
