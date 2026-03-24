import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Key, CheckCircle2, XCircle, Eye, EyeOff, Save, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ApiSettingsCard = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const saveKey = async () => {
    const { error } = await supabase
      .from("system_api_keys")
      .upsert({ provider: "gemini", api_key: apiKey.trim() }, { onConflict: "provider" });

    if (error) throw new Error("Falha ao salvar a chave no banco de dados.");
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;

    setIsTesting(true);
    setTestStatus("idle");

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error?.message || "Chave inválida ou sem permissão.";
        throw new Error(msg);
      }

      setTestStatus("success");

      // Salva automaticamente após teste com sucesso
      await saveKey();

      toast({
        title: "✅ Chave válida e salva!",
        description: "Conexão com o Gemini estabelecida com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no teste da API:", error);
      setTestStatus("error");
      toast({
        title: "Teste falhou",
        description: error.message || "Não foi possível conectar ao Gemini.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveWithoutTest = async () => {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    try {
      await saveKey();
      toast({
        title: "Chave salva",
        description: "A chave foi salva sem validação. O Orbi tentará usá-la normalmente.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
          Gerencie a chave da Inteligência Artificial do Google utilizada pelo Orbi.{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            Obter chave <ExternalLink className="h-3 w-3" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
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
              placeholder="AIzaSy..."
              disabled={isLoading || isTesting || isSaving}
              className={`pr-10 ${
                testStatus === "success"
                  ? "border-green-500 focus-visible:ring-green-500"
                  : testStatus === "error"
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
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
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Comunicação estabelecida com o Gemini!
            </p>
          )}
          {testStatus === "error" && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Chave inválida. Verifique se a API está ativada no{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          )}
        </div>

        {/* Botão principal: Testar + Salvar */}
        <Button
          onClick={handleTest}
          disabled={isLoading || isTesting || isSaving || !apiKey.trim()}
          className={`w-full ${
            testStatus === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : testStatus === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : ""
          }`}
        >
          {isTesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Key className="mr-2 h-4 w-4" />
          )}
          {isTesting ? "Testando..." : "Testar e Salvar"}
        </Button>

        {/* Fallback: Salvar sem testar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveWithoutTest}
          disabled={isLoading || isTesting || isSaving || !apiKey.trim()}
          className="w-full text-muted-foreground text-xs h-8"
        >
          {isSaving ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Save className="mr-1 h-3 w-3" />
          )}
          Salvar sem testar
        </Button>
      </CardContent>
    </Card>
  );
};
