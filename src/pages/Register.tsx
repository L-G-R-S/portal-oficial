import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logoImage from '@/assets/logo-prime-control.png';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'executivo' | 'marketing' | 'comercial'>('marketing');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [receiveEmailUpdates, setReceiveEmailUpdates] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const ALLOWED_DOMAIN = 'primecontrol.com.br';
  const ALLOWED_EMAILS = ['luguilherme07@gmail.com']; // Emails permitidos como exceção (super admin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Validar domínio do email ou exceção
    const emailLower = email.toLowerCase();
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const isAllowedException = ALLOWED_EMAILS.includes(emailLower);
    const isAllowedDomain = emailDomain === ALLOWED_DOMAIN;

    if (!isAllowedException && !isAllowedDomain) {
      toast.error(`Por favor, utilize seu e-mail corporativo da Prime Control (@${ALLOWED_DOMAIN})`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, role, receiveEmailUpdates);

    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada com sucesso!');
      navigate('/');
    }

    setLoading(false);
  };

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

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">CRIAR CONTA</h2>
            <p className="mt-2 text-muted-foreground">Preencha seus dados</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-foreground">Função</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="executivo">Executivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Email Updates Opt-in */}
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border">
              <Checkbox 
                id="emailUpdates" 
                checked={receiveEmailUpdates}
                onCheckedChange={(checked) => setReceiveEmailUpdates(!!checked)}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="emailUpdates" 
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  Receber novidades por e-mail
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alertas sobre notícias e movimentações do mercado
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
