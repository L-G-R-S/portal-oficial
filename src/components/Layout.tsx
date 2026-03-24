import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full max-w-[100vw] overflow-x-hidden bg-background pb-16 md:pb-0">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shadow-sm flex-shrink-0">
            {/* Mantemos o SidebarTrigger visível no desktop. No mobile, a Bottom Nav tem o Menu. */}
            <SidebarTrigger className="hidden md:flex" />
            
            {/* No mobile o logo ou nome aparece aqui ao invés do hambúrguer. */}
            <div className="md:hidden font-bold text-lg text-primary">
              PriMKT
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <FloatingChatButton />
    </SidebarProvider>
  );
}
