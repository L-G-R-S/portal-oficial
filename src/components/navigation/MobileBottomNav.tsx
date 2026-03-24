import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Briefcase, Menu as MenuIcon, UserPlus, Settings, LogOut, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileAvatar, getInitials } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { avatarUrl } = useProfileAvatar(profile?.user_id);

  const handleNavigation = (url: string) => {
    navigate(url);
    setIsOpen(false);
  };

  const navItems = [
    { title: "Início", url: "/", icon: Home },
    { title: "Concorrentes", url: "/competitors", icon: Users },
  ];

  const secondaryNavItems = [
    { title: "Clientes", url: "/clientes", icon: Briefcase },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_15px_-4px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex flex-row justify-between items-center h-16 w-full px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-[22px] w-[22px]", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{item.title}</span>
            </NavLink>
          );
        })}

        {/* Espaço para o botão Orbi flutuante */}
        <div className="w-[68px] flex-shrink-0 h-16 pointer-events-none flex flex-col items-center justify-end pb-1.5">
          {/* Label do Orbi debaixo do botão flutuante */}
          <span className="text-[10px] font-medium text-muted-foreground">Orbi</span>
        </div>

        {secondaryNavItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-[22px] w-[22px]", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{item.title}</span>
            </NavLink>
          );
        })}

        {/* Menu Toggle com Sheet Deslizante */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <MenuIcon className="h-[22px] w-[22px]" strokeWidth={2} />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] bg-card border-none rounded-t-3xl px-0 pb-0 pt-6 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <SheetHeader className="px-6 mb-8 w-full text-left">
              <SheetTitle className="text-foreground text-xl font-bold tracking-tight">Menu Principal</SheetTitle>
            </SheetHeader>
            <div className="flex-1 w-full overflow-y-auto px-6 space-y-10">
              
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Acessos Rápidos</h4>
                <div className="flex flex-col gap-1">
                  <button className="flex items-center w-full h-12 text-left text-foreground/90 hover:text-foreground font-medium text-base transition-colors" onClick={() => handleNavigation('/prospects')}>
                    Prospects
                  </button>
                  <button className="flex items-center w-full h-12 text-left text-foreground/90 hover:text-foreground font-medium text-base transition-colors" onClick={() => handleNavigation('/knowledge-base')}>
                    Base de Conhecimento
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Análises</h4>
                <div className="flex flex-col gap-1">
                  <button className="flex items-center w-full h-12 text-left text-foreground/90 hover:text-foreground font-medium text-base transition-colors" onClick={() => handleNavigation('/analise-inteligente')}>
                    Análise de Concorrente
                  </button>
                  <button className="flex items-center w-full h-12 text-left text-foreground/90 hover:text-foreground font-medium text-base transition-colors" onClick={() => handleNavigation('/analise-prospect')}>
                    Análise de Prospect
                  </button>
                  <button className="flex items-center w-full h-12 text-left text-foreground/90 hover:text-foreground font-medium text-base transition-colors" onClick={() => handleNavigation('/analise-cliente')}>
                    Análise de Cliente
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Profile Section */}
            {profile && (
              <div className="w-full border-t border-border p-6 bg-muted/30 mt-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-border/50">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleNavigation('/settings')} className="text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive hover:bg-black/5 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
