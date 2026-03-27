import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquarePlus, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfileAvatar, getInitials, getRoleLabel } from "@/hooks/useProfile";

type FeedbackTopico = "Solicitação" | "Informação" | "Reclamação" | "Elogio";

interface FeedbackDialogProps {
  children?: React.ReactNode;
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [topico, setTopico] = useState<FeedbackTopico | "">("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topico) {
      toast({
        title: "Tópico obrigatório",
        description: "Por favor, selecione um tópico antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, descreva o problema ou sugestão.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('feedbacks')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('feedbacks')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      const { error: insertError } = await (supabase
        .from('feedbacks' as any) as any)
        .insert({
          user_id: user?.id,
          user_full_name: profile?.full_name,
          user_email: user?.email,
          user_role: profile?.role ? getRoleLabel(profile.role) : 'Usuário',
          message,
          screenshot_url: screenshotUrl,
          status: 'pending',
          metadata: {
            topico,
            userAgent: navigator.userAgent,
            pathname: window.location.pathname,
          }
        });

      if (insertError) throw insertError;

      setIsSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setOpen(false);
        // Reset success state after closing animation
        setTimeout(() => {
          setIsSuccess(false);
          setTopico("");
        }, 300);
      }, 2000);

      // Reset form
      setMessage("");
      setFile(null);
    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Ocorreu um erro ao processar seu feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent">
            <MessageSquarePlus className="h-4 w-4" />
            <span className="text-sm font-medium">Feedback / Ajuda</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Feedback enviado!</h3>
              <p className="text-sm text-muted-foreground">
                Obrigado por nos ajudar a melhorar o portal.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Relatar problema ou sugestão</DialogTitle>
              <DialogDescription>
                Descreva o que aconteceu ou o que podemos melhorar. Você também pode anexar um print da tela.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="topico">
                  Tópico <span className="text-destructive">*</span>
                </Label>
                <Select value={topico} onValueChange={(v) => setTopico(v as FeedbackTopico)}>
                  <SelectTrigger id="topico">
                    <SelectValue placeholder="Selecione um tópico..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solicitação">Solicitação</SelectItem>
                    <SelectItem value="Informação">Informação</SelectItem>
                    <SelectItem value="Reclamação">Reclamação</SelectItem>
                    <SelectItem value="Elogio">Elogio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Sua mensagem</Label>
                <Textarea 
                  id="message" 
                  placeholder="Ex: Ocorreu um erro ao carregar as notícias da empresa X..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="screenshot" className="flex items-center gap-2 cursor-pointer text-primary hover:underline">
                  <ImageIcon className="h-4 w-4" />
                  {file ? file.name : "Anexar print (opcional)"}
                </Label>
                <Input 
                  id="screenshot" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Feedback"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
