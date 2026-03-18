import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Image, Trash2, Download, Eye, Database, AlertCircle, Plus, Upload, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface KnowledgeDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  content_summary: string | null;
  extracted_text?: string | null;
  processing_status?: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
}

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  // Bloquear acesso para não-admins
  if (!authLoading && !isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Base de Conhecimento</h1>
            <p className="text-sm text-muted-foreground">Documentos para o Orbi</p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Apenas administradores podem acessar e gerenciar a Base de Conhecimento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as unknown as KnowledgeDocument[]) || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalSize = () => {
    return documents.reduce((acc, doc) => acc + doc.file_size, 0);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-primary" />;
    }
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const handleDeleteDocument = async (doc: KnowledgeDocument) => {
    setDeleting(doc.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('chat-uploads')
        .remove([doc.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Documento excluído');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Delete all files from storage
      const paths = documents.map(d => d.storage_path);
      if (paths.length > 0) {
        await supabase.storage.from('chat-uploads').remove(paths);
      }

      // Delete all from database
      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setDocuments([]);
      toast.success('Todos os documentos foram excluídos');
    } catch (error) {
      console.error('Error deleting all documents:', error);
      toast.error('Erro ao excluir documentos');
    }
  };

  const handleViewDocument = async (doc: KnowledgeDocument) => {
    try {
      const { data } = await supabase.storage
        .from('chat-uploads')
        .createSignedUrl(doc.storage_path, 3600);

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Erro ao abrir documento');
    }
  };

  const handleDownloadDocument = async (doc: KnowledgeDocument) => {
    try {
      const { data } = await supabase.storage
        .from('chat-uploads')
        .createSignedUrl(doc.storage_path, 3600);

      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Tipo de arquivo não suportado: ${file.name}`);
          continue;
        }

        // Upload to storage
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${user.id}/${timestamp}_${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-uploads')
          .upload(storagePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        // 2. Save to database
        const { data: dbData, error: dbError } = await supabase
          .from('knowledge_documents')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath,
            content_summary: `Documento adicionado manualmente: ${file.name}`,
            processing_status: 'pending'
          })
          .select()
          .single();

        if (dbError || !dbData) {
          console.error('Database error:', dbError);
          toast.error(`Erro ao salvar ${file.name}`);
          continue;
        }

        // 3. Trigger processing (Embedding generation)
        supabase.functions.invoke('process-knowledge', {
          body: { documentId: dbData.id }
        }).catch(err => console.error("Async processing error:", err));

        toast.success(`${file.name} adicionado e sendo processado`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Erro ao processar ${file.name}`);
      }
    }

    // Reload documents
    await loadDocuments();
    setUploading(false);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Base de Conhecimento</h1>
            <p className="text-muted-foreground">Gerencie os documentos armazenados do Orbi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={handleUploadClick} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Adicionar
          </Button>
        
          {documents.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir todos os documentos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os {documents.length} documentos serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-sm text-muted-foreground">Documentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatFileSize(getTotalSize())}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Documentos Armazenados
          </CardTitle>
          <CardDescription>
            Arquivos que o Orbi pode acessar e referenciar nas conversas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum documento armazenado</p>
              <p className="text-sm mt-1">
                Envie documentos no chat com o comando "guarde isso" para armazenar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {doc.file_type.split('/')[1]?.toUpperCase() || doc.file_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {doc.processing_status === 'processing' && (
                        <Badge variant="outline" className="text-xs animate-pulse bg-blue-50 text-blue-600 border-blue-200">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processando...
                        </Badge>
                      )}
                      {doc.processing_status === 'completed' && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          Disponível para Orbi
                        </Badge>
                      )}
                    </div>
                    {doc.content_summary && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {doc.content_summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDocument(doc)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === doc.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O arquivo "{doc.file_name}" será permanentemente excluído.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDocument(doc)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
