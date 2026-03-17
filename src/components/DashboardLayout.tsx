import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - hidden on mobile, visible on md+ */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-3 sm:p-4 md:p-6 max-w-full" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
