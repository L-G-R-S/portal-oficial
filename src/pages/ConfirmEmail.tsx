import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo-prime-control.png';

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="h-24 w-auto mx-auto mb-8"
          />
        </div>
      </div>

      {/* Right side - Message */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <MailCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Confirme seu e-mail</h2>
            <p className="mt-4 text-muted-foreground text-base">
              Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
            </p>
          </div>

          <div className="pt-6">
            <Link to="/login">
              <Button className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                Ir para o Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
