import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-12 border-b bg-card px-4 flex items-center justify-between">
            <SidebarTrigger />
            <NotificationBell />
          </div>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <FloatingChatButton />
    </SidebarProvider>
  );
}
