import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, Mic, MicOff, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UploadedFile {
  name: string;
  type: string;
  url: string;
  size: number;
  base64?: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  allowFileUpload?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
];

export function ChatInput({ 
  onSend, 
  isLoading, 
  placeholder = "Digite sua pergunta...",
  allowFileUpload = true 
}: ChatInputProps) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Use webm format which is widely supported
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recorded audio
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Erro ao gravar áudio");
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Permissão do microfone negada. Habilite nas configurações do navegador.", {
          duration: 5000,
        });
      } else {
        toast.error("Erro ao acessar o microfone. Verifique as permissões.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (data:audio/webm;base64,)
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      
      const base64Audio = await base64Promise;
      
      // Send to Edge Function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error("Transcription error:", error);
        throw new Error(error.message || "Erro ao transcrever áudio");
      }

      if (data?.text) {
        setInput(prev => prev + (prev ? ' ' : '') + data.text);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro ao transcrever áudio";
      toast.error(errorMsg, { duration: 4000 });
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Convert file to base64 for AI processing
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = () => {
    if ((input.trim() || files.length > 0) && !isLoading && !isUploading && !isTranscribing) {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      const messageWithFiles = files.length > 0 
        ? `${input.trim()}\n\n[Arquivos anexados: ${files.map(f => f.name).join(", ")}]`
        : input.trim();
      
      onSend(messageWithFiles, files);
      setInput("");
      setFiles([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (!user?.id) {
      toast.error("Você precisa estar logado para enviar arquivos");
      return;
    }

    setIsUploading(true);

    for (const file of Array.from(selectedFiles)) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Arquivo muito grande (máx 10MB): ${file.name}`);
        continue;
      }

      try {
        // Convert to base64 for AI processing (images and PDFs)
        let base64Data: string | undefined;
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          base64Data = await fileToBase64(file);
        }

        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("chat-uploads")
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("chat-uploads")
          .getPublicUrl(data.path);

        setFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          url: urlData.publicUrl,
          size: file.size,
          base64: base64Data,
        }]);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const isVoiceDisabled = isLoading || isUploading || isTranscribing;

  return (
    <div className="border-t border-border bg-background">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b border-border">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm"
            >
              {getFileIcon(file.type)}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 p-4">
        {allowFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              className="flex-shrink-0 h-11 w-11"
              title="Anexar arquivo"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          </>
        )}

        {/* Voice Input Button - Whisper API */}
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={toggleRecording}
          disabled={isVoiceDisabled}
          className="flex-shrink-0 h-11 w-11"
          title={isRecording ? "Parar gravação" : isTranscribing ? "Transcrevendo..." : "Gravar áudio"}
        >
          {isTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRecording ? (
            <Square className="h-4 w-4 fill-current animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "🎤 Gravando..." : isTranscribing ? "Transcrevendo..." : placeholder}
          disabled={isLoading || isUploading}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && files.length === 0) || isLoading || isUploading || isTranscribing}
          size="icon"
          className="flex-shrink-0 h-11 w-11"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
