import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  ChevronDown,
  LogOut,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
import logoImage from "@/assets/logo-prime-control.png";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileAvatar, getInitials, getRoleLabel } from "@/hooks/useProfile";

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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [isCompetitorsOpen, setIsCompetitorsOpen] = useState(false);
  const [isProspectsOpen, setIsProspectsOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const { profile, signOut, isSuperAdmin } = useAuth();
  const { avatarUrl } = useProfileAvatar(profile?.user_id);
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Prime Control" 
            className="h-10 w-auto"
          />
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
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Competitors Dropdown */}
              <SidebarMenuItem>
                <Collapsible open={isCompetitorsOpen} onOpenChange={setIsCompetitorsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                      <Users className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left">Concorrentes</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isCompetitorsOpen && "rotate-180")} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1">
                        {competitorItems.map((item) => (
                          <SidebarMenuButton key={item.title} asChild>
                            <NavLink 
                              to={item.url}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
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

              {/* Prospects Dropdown */}
              <SidebarMenuItem>
                <Collapsible open={isProspectsOpen} onOpenChange={setIsProspectsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                      <UserPlus className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left">Prospects</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isProspectsOpen && "rotate-180")} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1">
                        {prospectItems.map((item) => (
                          <SidebarMenuButton key={item.title} asChild>
                            <NavLink 
                              to={item.url}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
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

              {/* Clients Dropdown */}
              <SidebarMenuItem>
                <Collapsible open={isClientsOpen} onOpenChange={setIsClientsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                      <Briefcase className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left">Clientes</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isClientsOpen && "rotate-180")} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1">
                        {clientItems.map((item) => (
                          <SidebarMenuButton key={item.title} asChild>
                            <NavLink 
                              to={item.url}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
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



            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
