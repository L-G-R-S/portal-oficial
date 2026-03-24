import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImage from '@/assets/logo-prime-control.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu e-mail');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Erro ao enviar e-mail. Verifique se o e-mail está correto.');
      console.error('Reset password error:', error);
    } else {
      setEmailSent(true);
      toast.success('E-mail enviado! Verifique sua caixa de entrada.');
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Brand */}
        <div className="hidden lg:flex lg:w-1/2 bg-secondary items-center justify-center p-12">
          <div className="max-w-md text-center">
            <img src={logoImage} alt="Logo" className="h-24 w-auto mx-auto mb-8" />
          </div>
        </div>

        {/* Right side - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">E-mail Enviado!</h2>
              <p className="mt-4 text-muted-foreground">
                Enviamos um link para recuperação de senha para <strong>{email}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 text-base"
              >
                Voltar para o Login
              </Button>
              
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full h-12 text-base"
              >
                Enviar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img src={logoImage} alt="Logo" className="h-24 w-auto mx-auto mb-8" />
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">RECUPERAR SENHA</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Digite seu e-mail corporativo para receber as instruções
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <Label htmlFor="email" className="text-foreground">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@primecontrol.com.br"
                required
                className="h-10 text-sm mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Enviando instruções...' : 'Enviar instruções'}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
