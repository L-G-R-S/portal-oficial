import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Key, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ApiSettingsCard = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentKey();
  }, []);

  const fetchCurrentKey = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_api_keys")
        .select("api_key")
        .eq("provider", "gemini")
        .maybeSingle();

      if (error) throw error;
      if (data) setApiKey(data.api_key);
    } catch (error) {
      console.error("Erro ao buscar API Key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira a chave da API do Gemini.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestStatus("idle");

    try {
      // Realiza o teste rápido no Gemini
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || "Chave de API inválida ou sem permissão.");
      }

      setTestStatus("success");

      // Salva no banco apontando update para 'gemini'
      const { error } = await supabase
        .from("system_api_keys")
        .upsert({ provider: "gemini", api_key: apiKey }, { onConflict: "provider" });

      if (error) {
        console.error("Erro interno no Supabase upsert:", error);
        throw new Error("Sucesso no teste, mas falha ao salvar as permissões no sistema.");
      }

      toast({
        title: "API Atualizada com sucesso",
        description: "A chave do sistema foi testada e configurada perfeitamente.",
      });
    } catch (error: any) {
      console.error("Erro no teste da API:", error);
      setTestStatus("error");
      toast({
        title: "Teste Falhou",
        description: error.message || "A chave fornecida retornou falha na conexão.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Configuração da API (Gemini)
        </CardTitle>
        <CardDescription>
          Gerencie a chave da Inteligência Artificial do Google utilizada pelo assistente virtual Orbi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="gemini-key">Chave de API do Google AI (Gemini)</Label>
          <div className="relative flex items-center">
            <Input
              id="gemini-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus("idle");
              }}
              placeholder="Ex: AIzaSy..."
              disabled={isLoading || isTesting}
              className={`pr-10 ${testStatus === 'success' ? 'border-green-500 focus-visible:ring-green-500' : testStatus === 'error' ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {testStatus === "success" && (
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Comunicação estabelecida!
            </p>
          )}
          {testStatus === "error" && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <XCircle className="h-3 w-3" /> Falha na comunicação
            </p>
          )}
        </div>

        <Button
          onClick={handleTestAndSave}
          disabled={isLoading || isTesting || !apiKey.trim()}
          className={`w-full ${testStatus === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : testStatus === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
        >
          {isTesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <Key className="mr-2 h-4 w-4" />
          )}
          {isTesting ? "Testando..." : "Testar e Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
};
