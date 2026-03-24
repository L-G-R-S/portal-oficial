import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisContext, EntityType } from "@/contexts/AnalysisContext";
import { toast } from "sonner";
import type { UploadedFile } from "@/components/chat/ChatInput";
import { generateCompetitorReport } from "@/utils/pdfReportGenerator";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
}

interface UseAIChatOptions {
  entityId?: string;
  entityType?: "competitor" | "prospect" | "client" | "primary";
  persistHistory?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

// Keywords that trigger document storage
const SAVE_KEYWORDS = [
  'guarde', 'guardar', 'guarda', 
  'salve', 'salvar', 'salva',
  'armazene', 'armazenar', 'armazena',
  'memorize', 'memorizar', 'memoriza',
  'lembre', 'lembrar', 'lembra',
  'grave', 'gravar', 'grava',
  'base de conhecimento',
  'knowledge base'
];

// Check if message contains save request
const shouldSaveDocument = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return SAVE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

// Keywords that detect direct action intents to handle client-side
const DELETE_PHOTO_KEYWORDS = [
  'remova minha foto', 'remove minha foto', 'remover foto', 'remova a foto',
  'delete minha foto', 'deletar foto', 'excluir foto', 'exclua minha foto',
  'remova meu perfil', 'apague minha foto', 'apagar foto',
];

const detectDeletePhotoIntent = (message: string): boolean => {
  const lower = message.toLowerCase();
  return DELETE_PHOTO_KEYWORDS.some(kw => lower.includes(kw));
};

// Detect an analyze company command like "analise labs2dev.com" or "analise a empresa xpto.com como prospect"
const detectAnalyzeIntent = (message: string): { domain: string; entityType: string } | null => {
  const lower = message.toLowerCase();
  // Broad regex to detect analysis request patterns
  const patterns = [
    /analis[ea](?:\s+a\s+empresa|\s+o\s+dom[ií]nio|\s+novamente)?\s+([a-z0-9.-]+\.[a-z]{2,})/i,
    /(?:analise|analisar|fazer análise de|iniciar análise de)\s+([a-z0-9.-]+\.[a-z]{2,})/i,
  ];
  
  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const domain = match[1].trim();
      const entityType = lower.includes('prospect') ? 'prospect'
        : lower.includes('cliente') ? 'client'
        : 'competitor';
      return { domain, entityType };
    }
  }
  return null;
};

// Keywords that detect PDF report requests
const PDF_KEYWORDS = [
  'me d\u00ea o pdf', 'me d\u00ea o relat\u00f3rio', 'gerar pdf', 'gere o pdf',
  'baixar pdf', 'baixar relat\u00f3rio', 'gerar relat\u00f3rio', 'quero o pdf',
  'me manda o pdf', 'me mande o pdf', 'pode gerar o pdf', 'pode gerar o relat\u00f3rio',
  'preciso do pdf', 'exportar pdf', 'exporta o pdf',
];

const detectPdfIntent = (message: string): boolean => {
  const lower = message.toLowerCase();
  return PDF_KEYWORDS.some(kw => lower.includes(kw));
};

// Action type for Orbi tool calling
interface OrbiAction {
  action: string;
  params: Record<string, any>;
}

// Generate friendly message based on action type
const getActionFriendlyMessage = (action: OrbiAction, extra?: string): string => {
  switch (action.action) {
    case 'analyze_company':
      const entityLabels: Record<string, string> = {
        competitor: 'concorrente',
        prospect: 'prospect',
        client: 'cliente'
      };
      const entityLabel = entityLabels[action.params.entityType] || 'empresa';
      
      return `🚀 **Análise Iniciada!**

Estou analisando o domínio **${action.params.domain}** como ${entityLabel}.

✅ A análise está sendo processada em segundo plano
📊 Você será notificado quando estiver concluída
📋 O resultado aparecerá na lista de ${entityLabel}s

Enquanto isso, você pode continuar me fazendo perguntas!`;
    
    case 'generate_entity_report':
      return `📄 **Relatório Pronto!**

${extra || 'Clique no botão abaixo para baixar o PDF.'}

O arquivo contém todas as informações da empresa: visão geral, redes sociais, Glassdoor, notícias de mercado e muito mais.`;
    
    case 'update_profile_picture':
      return `✅ **Foto de Perfil Atualizada!**

Sua nova foto de perfil foi salva com sucesso.`;
    
    case 'delete_profile_picture':
      return `✅ **Foto de Perfil Removida!**

Sua foto de perfil foi excluída com sucesso. Agora está exibindo as iniciais do seu nome.`;
    
    default:
      return 'Ação executada com sucesso!';
  }
};

export function useAIChat(options: UseAIChatOptions = {}) {
  const { persistHistory = true } = options;
  const { user } = useAuth();
  const { startAnalysis } = useAnalysisContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Function to detect and execute Orbi actions from AI response
  const executeOrbiAction = useCallback(async (content: string, lastFiles?: UploadedFile[]): Promise<{ executed: boolean; friendlyMessage?: string }> => {
    // Check if response contains an action instruction
    const actionMatch = content.match(/\[ORBI_ACTION\]([\s\S]*?)\[\/ORBI_ACTION\]/);
    if (!actionMatch) return { executed: false };

    try {
      let jsonStr = actionMatch[1].trim();
      // Remove any markdown code blocks that Gemini might add
      jsonStr = jsonStr.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
      const actionData: OrbiAction = JSON.parse(jsonStr);
      
      switch (actionData.action) {
        case 'analyze_company':
          const { domain, entityType = 'competitor' } = actionData.params;
          if (domain) {
            // Execute action without blocking
            startAnalysis(domain, entityType as EntityType).catch(err => {
              console.error("Analysis start error:", err);
            });
            return { 
              executed: true, 
              friendlyMessage: getActionFriendlyMessage(actionData) 
            };
          }
          break;
        
        case 'generate_entity_report':
          const { entityId: reportEntityId, entityType: reportEntityType } = actionData.params;
          if (reportEntityId && reportEntityType) {
            try {
              // Fetch entity data for report generation
              const tableNames: Record<string, string> = {
                competitor: 'companies',
                prospect: 'prospects',
                client: 'clients',
                primary: 'primary_company'
              };
              const tableName = tableNames[reportEntityType] || 'companies';
              
              const { data, error: entityError } = await supabase
                .from(tableName as any)
                .select('*')
                .eq('id', reportEntityId)
                .single();
              
              const entityData = data as any;
              
              if (entityError || !entityData) {
                console.error("Error fetching entity for report:", entityError);
                return { 
                  executed: true, 
                  friendlyMessage: '❌ **Erro ao gerar relatório**\n\nNão foi possível encontrar os dados da empresa. Tente novamente.' 
                };
              }
              
              // Generate the PDF
              const companyData = {
                name: entityData?.name || entityData?.domain,
                domain: entityData?.domain,
                industry: entityData?.industry || entityData?.linkedin_industry,
                sector: entityData?.sector,
                size: entityData?.size,
                headquarters: entityData?.headquarters,
                hq_location: entityData?.hq_location,
                year_founded: entityData?.year_founded,
                employees: entityData?.employee_count,
                description: entityData?.description,
                logo_url: entityData?.logo_url,
                linkedin_tagline: entityData?.linkedin_tagline || entityData?.tagline,
                linkedin_followers: entityData?.linkedin_followers,
                instagram_followers: entityData?.instagram_followers,
                youtube_subscribers: entityData?.youtube_subscribers,
                youtube_total_views: entityData?.youtube_total_views,
                products_services: entityData?.products_services,
                differentiators: entityData?.differentiators,
              };
              
              await generateCompetitorReport({
                competitor: companyData,
                company: companyData,
                glassdoor: null,
                marketResearch: null,
                marketNews: [],
                leadership: [],
                similarCompanies: [],
                socialPosts: {
                  linkedin: [],
                  instagram: [],
                  youtube: [],
                },
              });
              
              const fileName = `relatorio_${(entityData.name || entityData.domain).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`;
              
              return { 
                executed: true, 
                friendlyMessage: getActionFriendlyMessage(actionData, `O download de **${fileName}** foi iniciado automaticamente.`) 
              };
            } catch (reportError) {
              console.error("Error generating report:", reportError);
              return { 
                executed: true, 
                friendlyMessage: '❌ **Erro ao gerar relatório**\n\nOcorreu um erro ao gerar o PDF. Tente novamente.' 
              };
            }
          }
          break;
        
        case 'update_profile_picture':
          // Get the last uploaded image file
          const imageFile = lastFiles?.find(f => f.type.startsWith('image/'));
          if (!imageFile || !user?.id) {
            return { 
              executed: true, 
              friendlyMessage: '❌ **Erro**\n\nNenhuma imagem foi enviada. Por favor, envie uma imagem junto com a mensagem.' 
            };
          }
          
          try {
            // Convert base64 to blob
            const base64Data = imageFile.base64?.split(',')[1];
            if (!base64Data) throw new Error('Invalid image data');
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: imageFile.type });
            
            // Upload to avatars bucket
            const fileExt = imageFile.name.split('.').pop() || 'jpg';
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, blob, { upsert: true });
            
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            // Update profiles table
            await supabase
              .from('profiles')
              .update({ avatar_url: urlData.publicUrl })
              .eq('user_id', user.id);
            
            // Dispatch event to update UI
            window.dispatchEvent(new CustomEvent('avatar-updated', { 
              detail: { avatarUrl: urlData.publicUrl } 
            }));
            
            return { 
              executed: true, 
              friendlyMessage: getActionFriendlyMessage(actionData) 
            };
          } catch (avatarError) {
            console.error("Error updating profile picture:", avatarError);
            return { 
              executed: true, 
              friendlyMessage: '❌ **Erro ao atualizar foto**\n\nNão foi possível salvar a imagem. Tente novamente.' 
            };
          }
        
        case 'delete_profile_picture':
          if (!user?.id) {
            return { 
              executed: true, 
              friendlyMessage: '❌ **Erro**\n\nUsuário não autenticado.' 
            };
          }
          
          try {
            // Get current avatar URL to find the file to delete
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('user_id', user.id)
              .single();
            
            if (profile?.avatar_url) {
              // Extract file path from URL
              const avatarUrl = profile.avatar_url;
              const pathMatch = avatarUrl.match(/avatars\/(.+)$/);
              if (pathMatch) {
                // Delete file from storage
                await supabase.storage
                  .from('avatars')
                  .remove([pathMatch[1]]);
              }
            }
            
            // Update profiles table to remove avatar_url
            await supabase
              .from('profiles')
              .update({ avatar_url: null })
              .eq('user_id', user.id);
            
            // Dispatch event to update UI
            window.dispatchEvent(new CustomEvent('avatar-updated', { 
              detail: { avatarUrl: null } 
            }));
            
            return { 
              executed: true, 
              friendlyMessage: getActionFriendlyMessage({ action: 'delete_profile_picture', params: {} }) 
            };
          } catch (deleteError) {
            console.error("Error deleting profile picture:", deleteError);
            return { 
              executed: true, 
              friendlyMessage: '❌ **Erro ao excluir foto**\n\nNão foi possível remover a imagem. Tente novamente.' 
            };
          }
        
        case 'list_entities':
          // This action is informational, handled by AI response
          return { executed: false };
          
        default:
          console.log("Unknown action:", actionData.action);
      }
    } catch (e) {
      console.error("Error parsing Orbi action:", e);
    }
    
    return { executed: false };
  }, [startAnalysis, user?.id]);

  // Load persisted messages on mount
  useEffect(() => {
    if (!persistHistory || !user?.id) return;

    const loadMessages = async () => {
      setIsLoadingHistory(true);
      try {
        let query = supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        // Filter by entity if provided
        if (options.entityId) {
          query = query.eq("entity_id", options.entityId);
        } else {
          query = query.is("entity_id", null);
        }

        if (options.entityType) {
          query = query.eq("entity_type", options.entityType);
        } else {
          query = query.is("entity_type", null);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error loading chat history:", fetchError);
          return;
        }

        if (data && data.length > 0) {
          setMessages(data.map((msg: any) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          })));
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessages();
  }, [user?.id, options.entityId, options.entityType, persistHistory]);

  // Save message to database
  const saveMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    if (!persistHistory || !user?.id) return;

    try {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        entity_id: options.entityId || null,
        entity_type: options.entityType || null,
        role,
        content,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  }, [user?.id, options.entityId, options.entityType, persistHistory]);

  const sendMessage = useCallback(async (content: string, files?: UploadedFile[]) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    
    // Check if user wants to save documents to knowledge base
    const wantsSave = shouldSaveDocument(content);
    const pdfFiles = files?.filter(f => f.type === 'application/pdf') || [];
    
    if (wantsSave && pdfFiles.length > 0 && user?.id) {
      // Save PDFs to knowledge base
      for (const file of pdfFiles) {
        try {
          const storagePath = file.url.split('/').slice(-2).join('/'); // Extract storage path from URL
          
          const { error: dbError } = await supabase
            .from("knowledge_documents")
            .insert({
              user_id: user.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: storagePath,
              content_summary: `Documento enviado via chat: ${file.name}`,
            });

          if (dbError) {
            console.error("Error saving document to knowledge base:", dbError);
          } else {
            console.log(`Document "${file.name}" saved to knowledge base`);
          }
        } catch (err) {
          console.error("Error processing document for knowledge base:", err);
        }
      }
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      files,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message
    await saveMessage("user", content.trim());

    // --- CLIENT-SIDE INTENT DETECTION ---
    // Detect and execute direct actions without relying on Gemini's ORBI_ACTION tags,
    // because Gemini's google_search tool registration conflicts with custom text patterns.
    const trimmedContent = content.trim();

    if (detectDeletePhotoIntent(trimmedContent) && user?.id) {
      try {
        await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', user.id);
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: null } }));
        const successMsg = getActionFriendlyMessage({ action: 'delete_profile_picture', params: {} });
        const assistantId = crypto.randomUUID();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: successMsg, timestamp: new Date() }]);
        await saveMessage('assistant', successMsg);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Error deleting profile picture (client-side):', e);
      }
    }

    const analyzeIntent = detectAnalyzeIntent(trimmedContent);
    if (analyzeIntent) {
      try {
        startAnalysis(analyzeIntent.domain, analyzeIntent.entityType as EntityType).catch(err => {
          console.error('Analysis error:', err);
        });
        const successMsg = getActionFriendlyMessage({ action: 'analyze_company', params: analyzeIntent });
        const assistantId = crypto.randomUUID();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: successMsg, timestamp: new Date() }]);
        await saveMessage('assistant', successMsg);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Error starting analysis (client-side):', e);
      }
    }

    // Client-side PDF generation: triggered when user is in entity context and requests a PDF
    if (detectPdfIntent(trimmedContent) && options.entityId && options.entityType) {
      const tableNames: Record<string, string> = {
        competitor: 'companies',
        prospect: 'prospects',
        client: 'clients',
        primary: 'primary_company'
      };
      const tableName = tableNames[options.entityType] || 'companies';
      const assistantId = crypto.randomUUID();

      // Add a 'generating...' placeholder message
      const loadingMsg = '⏳ **Gerando o PDF...** Aguarde um momento, estou preparando o relatório completo da empresa.';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: loadingMsg, timestamp: new Date() }]);

      try {
        const { data: entityData, error: entityError } = await supabase
          .from(tableName as any)
          .select('*')
          .eq('id', options.entityId)
          .single();

        if (entityError || !entityData) throw new Error('Entidade não encontrada');

        const ed = entityData as any;
        const companyData = {
          name: ed.name || ed.domain,
          domain: ed.domain,
          industry: ed.industry || ed.linkedin_industry,
          sector: ed.sector,
          size: ed.size,
          headquarters: ed.headquarters,
          hq_location: ed.hq_location,
          year_founded: ed.year_founded,
          employees: ed.employee_count,
          description: ed.description,
          logo_url: ed.logo_url,
          linkedin_tagline: ed.linkedin_tagline || ed.tagline,
          linkedin_followers: ed.linkedin_followers,
          instagram_followers: ed.instagram_followers,
          youtube_subscribers: ed.youtube_subscribers,
          youtube_total_views: ed.youtube_total_views,
          products_services: ed.products_services,
          differentiators: ed.differentiators,
        };

        await generateCompetitorReport({
          competitor: companyData,
          company: companyData,
          glassdoor: null,
          marketResearch: null,
          marketNews: [],
          leadership: [],
          similarCompanies: [],
          socialPosts: { linkedin: [], instagram: [], youtube: [] },
        });

        const fileName = `relatorio_${(ed.name || ed.domain).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`;
        const successMsg = `📄 **Relatório PDF Pronto!**

O download de **${fileName}** foi iniciado automaticamente.

O arquivo contém todas as informações da empresa: visão geral, redes sociais, Glassdoor, notícias de mercado e muito mais.`;
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: successMsg } : msg));
        await saveMessage('assistant', successMsg);
      } catch (e) {
        console.error('Error generating PDF (client-side):', e);
        const errMsg = '❌ **Erro ao gerar PDF**\n\nNão foi possível gerar o relatório. Tente novamente.';
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: errMsg } : msg));
        await saveMessage('assistant', errMsg);
      }

      setIsLoading(false);
      return;
    }
    // --- END CLIENT-SIDE INTENT DETECTION ---

    // Build conversation history for context
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Prepare files for multimodal processing
    const fileContents = files?.filter(f => f.base64).map(f => ({
      name: f.name,
      type: f.type,
      base64: f.base64,
    })) || [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: content.trim(),
          entityId: options.entityId,
          entityType: options.entityType,
          conversationHistory,
          files: fileContents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = crypto.randomUUID();
      let textBuffer = "";

      // Add initial assistant message
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch {
            // Incomplete JSON, put it back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

      // Check for actions and replace with friendly message
      if (assistantContent) {
        let finalContent = assistantContent;
        
        try {
          const { executed, friendlyMessage } = await executeOrbiAction(assistantContent, files);
          
          if (executed && friendlyMessage) {
            // Replace raw action with friendly message
            finalContent = friendlyMessage;
            
            // Update the displayed message
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: friendlyMessage }
                  : msg
              )
            );
          }
        } catch (actionError) {
          console.error("Error executing action:", actionError);
          // Continue with original content if action fails
        }
        
        // Save the final message (friendly or original)
        await saveMessage("assistant", finalContent);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      setError(errorMessage);
      
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.content !== "" || msg.role === "user"));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, user?.id, options.entityId, options.entityType, saveMessage, executeOrbiAction]);

  const clearMessages = useCallback(async () => {
    if (!user?.id) {
      setMessages([]);
      setError(null);
      return;
    }

    try {
      let query = supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user.id);

      if (options.entityId) {
        query = query.eq("entity_id", options.entityId);
      } else {
        query = query.is("entity_id", null);
      }

      if (options.entityType) {
        query = query.eq("entity_type", options.entityType);
      } else {
        query = query.is("entity_type", null);
      }

      await query;
    } catch (err) {
      console.error("Error clearing messages:", err);
    }

    setMessages([]);
    setError(null);
  }, [user?.id, options.entityId, options.entityType]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearMessages,
  };
}
