import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, Maximize2, Shrink } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileAvatar, getInitials } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

type ChatSize = "normal" | "expanded";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<ChatSize>("normal");
  
  const { user } = useAuth();
  const { avatarUrl } = useProfileAvatar(user?.id);
  const userInitials = getInitials(user?.user_metadata?.full_name || user?.email || "U");
  
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat({
    persistHistory: true,
  });

  const suggestions = [
    "Liste meus concorrentes",
    "Compare avaliações Glassdoor",
  ];

  const isExpanded = size === "expanded";

  const toggleSize = () => {
    setSize(size === "normal" ? "expanded" : "normal");
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className={cn(
          "fixed z-50 h-[70px] w-[70px] rounded-full hover:scale-110 transition-all duration-200 p-0 bg-transparent hover:bg-transparent border-none shadow-none",
          "bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <img src="/orbi-logo.png" alt="Orbi" className="w-full h-full object-contain filter drop-shadow-md" />
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out flex flex-col",
          // Mobile: normal = bottom sheet, expanded = full screen
          isExpanded
            ? "inset-x-2 inset-y-2 md:inset-auto md:top-4 md:right-4 md:bottom-4 md:w-[620px]"
            : "bottom-[88px] left-2 right-2 h-[480px] md:bottom-20 md:left-auto md:right-8 md:w-[380px] md:h-[520px]",
          // Always constrain height to viewport
          "max-h-[calc(100vh-1rem)]",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="h-full w-full bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                <img src="/orbi-logo.png" alt="Orbi" className="w-full h-full scale-125 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Orbi</h3>
                <p className="text-xs opacity-80">Assistente de Inteligência</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={clearMessages}
                  title="Limpar conversa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={toggleSize}
                title={isExpanded ? "Reduzir" : "Expandir"}
              >
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {(
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-transparent flex items-center justify-center mb-3">
                    <img src="/orbi-logo.png" alt="Orbi" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-medium mb-1 text-sm">Olá! Sou o Orbi</h3>
                  <p className="text-xs text-muted-foreground mb-3 max-w-[240px]">
                    Pergunte sobre qualquer empresa monitorada ou peça análises comparativas.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="divide-y divide-border">
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={`${msg.id}-${index}`}
                        role={msg.role}
                        content={msg.content}
                        isStreaming={isLoading && index === messages.length - 1 && msg.role === "assistant"}
                        userAvatar={avatarUrl}
                        userInitials={userInitials}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              <ChatInput 
                onSend={sendMessage} 
                isLoading={isLoading}
                placeholder="Pergunte ao Orbi..."
                allowFileUpload={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
