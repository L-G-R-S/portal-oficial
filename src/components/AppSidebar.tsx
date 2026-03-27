import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  ChevronDown,
  LogOut,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@/assets/logo-prime-vision.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileAvatar, getInitials, getRoleLabel } from "@/hooks/useProfile";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { MessageSquarePlus } from "lucide-react";

const competitorItems = [
  { title: "Lista de concorrentes", url: "/competitors" },
  { title: "Análise de concorrente", url: "/analise-inteligente" },
];

const prospectItems = [
  { title: "Lista de prospects", url: "/prospects" },
  { title: "Análise de prospect", url: "/analise-prospect" },
];

const clientItems = [
  { title: "Lista de clientes", url: "/clientes" },
  { title: "Análise de cliente", url: "/analise-cliente" },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [isCompetitorsOpen, setIsCompetitorsOpen] = useState(() => competitorItems.some(item => location.pathname.startsWith(item.url)));
  const [isProspectsOpen, setIsProspectsOpen] = useState(() => prospectItems.some(item => location.pathname.startsWith(item.url)));
  const [isClientsOpen, setIsClientsOpen] = useState(() => clientItems.some(item => location.pathname.startsWith(item.url)));
  
  const { profile, signOut, isSuperAdmin } = useAuth();
  const { avatarUrl } = useProfileAvatar(profile?.user_id);
  const navigate = useNavigate();

  useEffect(() => {
    if (competitorItems.some(item => location.pathname.startsWith(item.url))) setIsCompetitorsOpen(true);
    if (prospectItems.some(item => location.pathname.startsWith(item.url))) setIsProspectsOpen(true);
    if (clientItems.some(item => location.pathname.startsWith(item.url))) setIsClientsOpen(true);
  }, [location.pathname]);

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Prime Vision" 
            className="h-9 w-auto" 
          />
          {!collapsed && (
            <span className="text-xs font-semibold text-sidebar-foreground/60 bg-sidebar-accent px-2 py-0.5 rounded-md ml-auto">
              v1.0
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Dynamic Dropdowns */}
              {[
                { title: "Concorrentes", icon: Users, items: competitorItems, open: isCompetitorsOpen, setOpen: setIsCompetitorsOpen },
                { title: "Prospects", icon: UserPlus, items: prospectItems, open: isProspectsOpen, setOpen: setIsProspectsOpen },
                { title: "Clientes", icon: Briefcase, items: clientItems, open: isClientsOpen, setOpen: setIsClientsOpen }
              ].map((section) => (
                <SidebarMenuItem key={section.title}>
                  <Collapsible open={section.open} onOpenChange={section.setOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                        <section.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium flex-1 text-left">{section.title}</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", section.open && "rotate-180")} />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <div className="ml-6 space-y-2 mt-1 mb-2">
                          {section.items.map((item) => (
                            <SidebarMenuButton key={item.title} asChild>
                              <NavLink 
                                to={item.url}
                                className={({ isActive }) => cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                  "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
                                  (isActive || location.pathname.startsWith(item.url)) && "bg-white/10 text-white font-semibold"
                                )}
                              >
                                {item.title}
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </SidebarMenuItem>
              ))}





            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Space in the middle + Feedback at the bottom */}
        <div className="mt-auto pb-4">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="px-3 border-none bg-transparent">
                  <FeedbackDialog>
                    <button className={cn(
                      "flex items-center gap-2 px-1 py-1 w-fit rounded-md transition-all duration-200",
                      "text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 outline-none",
                      collapsed ? "mx-auto justify-center" : "justify-start"
                    )}>
                      <MessageSquarePlus className={cn("h-3.5 w-3.5", !collapsed && "mr-1")} />
                      {!collapsed && <span className="text-[10px] font-medium uppercase tracking-wider">Feedback / Ajuda</span>}
                    </button>
                  </FeedbackDialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {profile && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/settings")}
                className="flex items-center gap-3 w-full hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {getRoleLabel(profile.role)}
                  </p>
                </div>
              </button>
              <Button 
                onClick={signOut}
                variant="ghost" 
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate("/settings")}
                variant="ghost" 
                size="icon"
                className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-0"
                title="Configurações"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button 
                onClick={signOut}
                variant="ghost" 
                size="icon"
                className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
