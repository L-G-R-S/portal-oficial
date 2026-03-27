import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAction } from '@/hooks/useUserAction';
import { toast } from 'sonner';
import logoImage from '@/assets/logo-prime-vision.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { trackAction } = useUserAction();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('prk_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast.error('Email ou senha incorretos');
    } else {
      if (rememberMe) {
        localStorage.setItem('prk_remembered_email', email);
      } else {
        localStorage.removeItem('prk_remembered_email');
      }
      
      toast.success('Login realizado com sucesso!');
      trackAction('login', '/');
      navigate('/');
    }
    setLoading(false);
  };
  return <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img src={logoImage} alt="Logo" className="h-24 w-auto mx-auto mb-4" />
          <p className="text-primary/80 text-sm font-light italic tracking-wide">
            Seu radar estratégico de mercado.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tight">Bem-vindo</h2>
            <p className="mt-2 text-muted-foreground text-sm">Acesse sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" required className="h-10 text-sm" />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" required className="h-10 pr-10 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Lembrar-me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? 'Acessando...' : 'Acessar'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Cadastrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>;
}