import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error("ID do documento não fornecido");
    }

    // 1. Buscar metadados do documento
    const { data: document, error: docError } = await supabaseClient
      .from("knowledge_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) throw new Error("Documento não encontrado");

    // Atualizar status para processando
    await supabaseClient
      .from("knowledge_documents")
      .update({ processing_status: "processing" })
      .eq("id", documentId);

    // 2. Baixar o arquivo do Storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("chat-uploads")
      .download(document.storage_path);

    if (downloadError) throw downloadError;

    let text = "";

    // 3. Extrair texto (Lógica simplificada por enquanto - assume texto se PDF ou imagem for legível)
    // Para simplificar, vamos usar uma abordagem de extração direta se for texto/pdf simples
    // ou enviar para o Gemini Vision para descrever se for imagem.
    
    // Fetch dynamic API key if exists
    let apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    try {
      const { data: dbKey } = await supabaseClient.from("system_api_keys").select("api_key").eq("provider", "gemini").maybeSingle();
      if (dbKey?.api_key) apiKey = dbKey.api_key;
    } catch(e) {}
    
    if (document.file_type.includes("pdf")) {
      text = await extractTextWithGemini(fileData, document.file_type, apiKey);
    } else if (document.file_type.startsWith("image/")) {
      text = await extractTextWithGemini(fileData, document.file_type, apiKey);
    } else {
      text = new TextDecoder().decode(await fileData.arrayBuffer());
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Nenhum texto extraído do documento");
    }

    // 4. Chunking (dividir o texto em blocos de ~1000 caracteres com sobreposição)
    const chunks = chunkText(text, 1000, 200);

    // 5. Gerar embeddings e salvar
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk, apiKey);
      
      const { error: insertError } = await supabaseClient
        .from("knowledge_chunks")
        .insert({
          document_id: document.id,
          user_id: document.user_id,
          content: chunk,
          embedding: embedding,
        });

      if (insertError) console.error("Erro ao inserir chunk:", insertError);
    }

    // 6. Finalizar
    await supabaseClient
      .from("knowledge_documents")
      .update({ 
        processing_status: "completed",
        extracted_text: text.substring(0, 10000) // Guardar um pouco do texto original
      })
      .eq("id", documentId);

    return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro no process-knowledge:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractTextWithGemini(fileData: Blob, mimeType: string, apiKey?: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const base64Data = btoa(
    new Uint8Array(await fileData.arrayBuffer()).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  const payload = {
    contents: [{
      parts: [
        { text: "Extraia TODO o texto deste documento de forma literal, mantendo a estrutura. Se houver tabelas, descreva-as. Se for imagem, transcreva o texto nela contido." },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateEmbedding(text: string, apiKey: string | undefined) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-0608:embedContent?key=${apiKey}`;
  
  const payload = {
    model: "models/gemini-embedding-exp-0608",
    content: { parts: [{ text }] }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  return result.embedding.values;
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.substring(i, i + size));
    i += (size - overlap);
  }
  return chunks;
}
