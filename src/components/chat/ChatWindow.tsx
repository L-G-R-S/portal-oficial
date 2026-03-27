import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileAvatar, getInitials } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  entityId?: string;
  entityType?: "competitor" | "prospect" | "client" | "primary";
  entityName?: string;
  className?: string;
  title?: string;
  compact?: boolean;
}

export function ChatWindow({ entityId, entityType, entityName, className, title, compact = false }: ChatWindowProps) {
  const { user } = useAuth();
  const { avatarUrl } = useProfileAvatar(user?.id);
  const userInitials = getInitials(user?.user_metadata?.full_name || user?.email || "U");
  
  const { messages, isLoading, isLoadingHistory, error, sendMessage, clearMessages } = useAIChat({
    entityId,
    entityType,
    persistHistory: true,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getTitle = () => {
    if (title) return title;
    if (entityName) return `Chat sobre ${entityName}`;
    return "Assistente de Inteligência";
  };

  const getPlaceholder = () => {
    if (entityName) return `Pergunte sobre ${entityName}...`;
    return "Faça uma pergunta sobre seus dados...";
  };

  const suggestions = entityName
    ? [
        "Resuma os principais dados desta empresa",
        "O que os funcionários falam no Glassdoor?",
        "Quais são as notícias mais recentes?",
        "Compare com minha empresa",
      ]
    : [
        "Liste todos os concorrentes que monitoro",
        "Qual empresa tem mais seguidores no LinkedIn?",
        "Compare as avaliações do Glassdoor",
        "Quais as últimas notícias de mercado?",
      ];

  return (
    <Card className={cn("flex flex-col", compact ? "h-full" : "h-[600px]", className)}>
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-transparent flex items-center justify-center">
              <img src="/orbi-logo.png" alt="Orbi" className="w-full h-full scale-110 object-contain" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Orbi</h3>
              {entityName && (
                <p className="text-xs text-muted-foreground">Analisando: {entityName}</p>
              )}
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </CardHeader>
      )}

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-transparent flex items-center justify-center mb-3">
              <img src="/orbi-logo.png" alt="Orbi" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-medium mb-1 text-sm">Olá! Sou o Orbi</h3>
            <p className="text-xs text-muted-foreground mb-3 max-w-[260px]">
              {entityName 
                ? `Pergunte sobre ${entityName} ou compare com outras empresas.`
                : "Pergunte sobre qualquer empresa monitorada ou peça análises comparativas."
              }
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestions.slice(0, compact ? 2 : 4).map((suggestion, i) => (
                <SuggestionButton 
                  key={i} 
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </SuggestionButton>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1" ref={scrollRef}>
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

        {error && (
          <Alert variant="destructive" className="m-4 mt-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ChatInput 
          onSend={sendMessage} 
          isLoading={isLoading}
          placeholder={getPlaceholder()}
          allowFileUpload={true}
        />
      </CardContent>
    </Card>
  );
}

function SuggestionButton({ 
  children, 
  onClick,
  disabled 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}
