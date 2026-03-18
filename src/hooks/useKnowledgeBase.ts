import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaveDocumentParams {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  contentSummary?: string;
}

export function useKnowledgeBase() {
  const saveDocument = async ({
    userId,
    fileName,
    fileType,
    fileSize,
    storagePath,
    extractedText,
    contentSummary,
  }: SaveDocumentParams) => {
    try {
      const { error } = await supabase
        .from("knowledge_documents")
        .insert({
          user_id: userId,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          storage_path: storagePath,
          extracted_text: extractedText || null,
          content_summary: contentSummary || null,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error saving document to knowledge base:", error);
      return false;
    }
  };

  const getDocuments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching knowledge documents:", error);
      return [];
    }
  };

  return { saveDocument, getDocuments };
}