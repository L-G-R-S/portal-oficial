import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Database, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";

interface KnowledgeDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  content_summary: string | null;
  created_at: string;
}

export function KnowledgeBaseSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Base de Conhecimento
        </CardTitle>
        <CardDescription>
          Documentos armazenados para o Orbi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{documents.length}</span>
                <span className="text-muted-foreground">documentos</span>
              </div>
              {documents.length > 0 && (
                <div className="text-muted-foreground">
                  • {formatFileSize(getTotalSize())} total
                </div>
              )}
            </div>

            {/* Recent Documents Preview */}
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.slice(0, 2).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50 text-sm"
                  >
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate flex-1">{doc.file_name}</span>
                    <span className="text-muted-foreground text-xs shrink-0">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>
                ))}
                {documents.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center">
                    + {documents.length - 2} mais documentos
                  </p>
                )}
              </div>
            )}

            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum documento armazenado ainda
              </p>
            )}

            {/* Link to dedicated page */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(ROUTES.KNOWLEDGE_BASE)}
            >
              Gerenciar Base de Conhecimento
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}