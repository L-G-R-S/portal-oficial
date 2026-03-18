import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Bot, Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  userAvatar?: string | null;
  userInitials?: string;
}

interface OrbiFile {
  name: string;
  url: string;
  type: string;
}

// Parse ORBI_FILE tags for downloadable files
function parseOrbiFiles(text: string): { cleanText: string; files: OrbiFile[] } {
  const files: OrbiFile[] = [];
  const regex = /\[ORBI_FILE\](.*?)\[\/ORBI_FILE\]/gs;
  
  let cleanText = text;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    try {
      const fileData = JSON.parse(match[1]);
      files.push(fileData);
      cleanText = cleanText.replace(match[0], '');
    } catch (e) {
      console.error('Error parsing ORBI_FILE:', e);
    }
  }
  
  return { cleanText: cleanText.trim(), files };
}

// Format inline text (bold, italic, links, code)
function formatInline(line: string): string {
  // First, clean up any raw HTML anchor tags that might come from AI responses
  // Convert <a href="url" ...>text</a> to markdown [text](url)
  let cleanedLine = line
    .replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)')
    // Remove any leftover HTML tag attributes that got printed as text
    .replace(/target="_blank"\s*/g, '')
    .replace(/rel="noopener noreferrer"\s*/g, '')
    .replace(/class="[^"]*"\s*/g, '');
  
  return cleanedLine
    // Handle markdown links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 break-all">$1</a>')
    // Detect raw URLs (http://, https://, www.) - but not if already in href or after >
    .replace(
      /(?<!href="|">)(https?:\/\/[^\s<\]]+|www\.[^\s<\]]+)/gi,
      (match) => {
        const href = match.startsWith('www.') ? `https://${match}` : match;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 break-all">${match}</a>`;
      }
    )
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
}

// Simple markdown renderer - memoized for performance
function useRenderedMarkdown(text: string): JSX.Element[] | null {
  return useMemo(() => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={elements.length} className={cn(
            listType === "ul" ? "list-disc" : "list-decimal",
            "ml-4 space-y-1"
          )}>
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={index} className="font-semibold text-base mt-3 mb-1" 
              dangerouslySetInnerHTML={{ __html: formatInline(line.slice(4)) }} />
        );
        return;
      }
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={index} className="font-semibold text-lg mt-4 mb-2" 
              dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }} />
        );
        return;
      }
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={index} className="font-bold text-xl mt-4 mb-2" 
              dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        );
        return;
      }

      // Unordered list
      if (line.match(/^[-*]\s/)) {
        if (listType !== "ul") flushList();
        listType = "ul";
        listItems.push(line.slice(2));
        return;
      }

      // Ordered list
      if (line.match(/^\d+\.\s/)) {
        if (listType !== "ol") flushList();
        listType = "ol";
        listItems.push(line.replace(/^\d+\.\s/, ""));
        return;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="leading-relaxed" 
           dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });

    flushList();
    return elements;
  }, [text]);
}

// Extract storage path from URL
function extractStoragePath(url: string): string | null {
  try {
    // Handle signed URLs from Supabase Storage
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Pattern: /storage/v1/object/sign/chat-uploads/user_id/filename
    const signMatch = pathname.match(/\/storage\/v1\/object\/sign\/chat-uploads\/(.+)/);
    if (signMatch) {
      return signMatch[1];
    }
    
    // Pattern: /storage/v1/object/public/chat-uploads/path
    const publicMatch = pathname.match(/\/storage\/v1\/object\/public\/chat-uploads\/(.+)/);
    if (publicMatch) {
      return publicMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

// File download card component with improved download handling
function FileDownloadCard({ file }: { file: OrbiFile }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    
    try {
      // First, try to extract storage path and download via Supabase client
      const storagePath = extractStoragePath(file.url);
      
      if (storagePath) {
        // Use Supabase client to download (handles auth automatically)
        const { data, error: downloadError } = await supabase.storage
          .from('chat-uploads')
          .download(storagePath);
        
        if (downloadError) {
          console.error('Supabase download error:', downloadError);
          throw new Error(downloadError.message);
        }
        
        if (data) {
          const blobUrl = URL.createObjectURL(data);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          return;
        }
      }
      
      // Fallback: Try fetch with credentials
      const response = await fetch(file.url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Erro ao baixar. Clique para abrir em nova aba.');
      // Open in new tab as last resort
      window.open(file.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card mt-2">
      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-primary" />
        ) : (
          <FileText className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {isPdf ? 'Documento PDF' : isImage ? 'Imagem' : 'Arquivo'}
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleDownload} 
        disabled={downloading} 
        className="flex-shrink-0"
        aria-label={`Baixar arquivo ${file.name}`}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        Baixar
      </Button>
    </div>
  );
}

export function ChatMessage({ role, content, isStreaming, userAvatar, userInitials = "U" }: ChatMessageProps) {
  const isUser = role === "user";
  
  // Parse content for downloadable files
  const { cleanText, files } = useMemo(() => parseOrbiFiles(content), [content]);
  
  // Memoized markdown rendering for performance
  const renderedMarkdown = useRenderedMarkdown(cleanText);

  return (
    <div className={cn(
      "flex gap-3 p-4",
      isUser ? "bg-muted/50" : "bg-background"
    )}>
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={userAvatar || undefined} alt="User" className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0" aria-label="Assistente Orbi">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2 text-sm">
        {cleanText ? (
          <>
            {renderedMarkdown}
            {files.map((file, i) => (
              <FileDownloadCard key={i} file={file} />
            ))}
          </>
        ) : isStreaming ? (
          <div className="flex items-center gap-1" aria-label="Carregando resposta">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}