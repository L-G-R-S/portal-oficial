import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: string;
  user_full_name: string;
  user_email: string;
  user_role: string;
  message: string;
  screenshot_url: string | null;
  status: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
  metadata: any;
}

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase.from('feedbacks' as any).select('*').order('created_at', { ascending: false });
      
      if (filterStatus !== "all") {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar feedbacks:', error);
      toast({
        title: "Erro ao carregar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filterStatus]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase
        .from('feedbacks' as any)
        .update({ status: newStatus })
        .eq('id', id) as any);

      if (error) throw error;

      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as any } : f));
      toast({
        title: "Status atualizado",
        description: `Feedback marcado como ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('feedbacks' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;

      setFeedbacks(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Relato excluído",
        description: "O feedback foi removido permanentemente.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'reviewing': 
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><Eye className="w-3 h-3 mr-1" /> Analisando</Badge>;
      case 'resolved': 
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolvido</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTopicBadge = (topic: string) => {
    switch (topic) {
      case 'Reclamação':
        return <Badge variant="destructive" className="font-semibold">{topic}</Badge>;
      case 'Elogio':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white font-semibold">{topic}</Badge>;
      case 'Solicitação':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">{topic}</Badge>;
      case 'Informação':
        return <Badge variant="secondary" className="font-semibold">{topic}</Badge>;
      default:
        return topic ? <Badge variant="outline">{topic}</Badge> : null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedbacks e Problemas</h1>
            <p className="text-muted-foreground">Gerencie os relatos enviados pelos usuários da plataforma.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold text-xl">{feedbacks.length} Total</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Relatos</CardTitle>
              <CardDescription>Filtre e gerencie os feedbacks recebidos.</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="reviewing">Analisando</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Clock className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-medium">Nenhum feedback encontrado</p>
              <p className="text-muted-foreground text-sm">Os relatos enviados pelos usuários aparecerão aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tópico</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{feedback.user_full_name}</span>
                          <span className="text-xs text-muted-foreground">{feedback.user_role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTopicBadge(feedback.metadata?.topico)}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 text-sm">{feedback.message}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" /> Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getStatusBadge(feedback.status)}
                                  Feedback de {feedback.user_full_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded-lg">
                                  <div>
                                    <p className="font-semibold">Usuário</p>
                                    <p>{feedback.user_full_name} ({feedback.user_email})</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Contexto</p>
                                    <p>{feedback.metadata?.pathname || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Tópico</p>
                                    <div>{getTopicBadge(feedback.metadata?.topico) || <span className="text-muted-foreground">Não definido</span>}</div>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-semibold mb-1">Mensagem</p>
                                  <div className="p-3 bg-card border rounded-lg italic text-sm">
                                    "{feedback.message}"
                                  </div>
                                </div>
                                {feedback.screenshot_url && (
                                  <div>
                                    <p className="font-semibold mb-2 flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4" /> Print em anexo
                                    </p>
                                    <div className="border rounded-lg overflow-hidden bg-muted flex justify-center max-h-[400px]">
                                      <img 
                                        src={feedback.screenshot_url} 
                                        alt="Screenshot" 
                                        className="object-contain w-full h-full cursor-pointer"
                                        onClick={() => window.open(feedback.screenshot_url!, '_blank')}
                                      />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 text-center italic">Clique na imagem para abrir em tamanho real</p>
                                  </div>
                                )}
                                <div className="flex items-center gap-3 justify-end pt-4 border-t">
                                  <span className="text-sm font-medium">Mudar Status:</span>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant={feedback.status === 'reviewing' ? 'default' : 'outline'}
                                      onClick={() => updateStatus(feedback.id, 'reviewing')}
                                    >
                                      Analisar
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant={feedback.status === 'resolved' ? 'default' : 'outline'}
                                      onClick={() => updateStatus(feedback.id, 'resolved')}
                                    >
                                      Resolver
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O relato de {feedback.user_full_name} será excluído permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFeedback(feedback.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
