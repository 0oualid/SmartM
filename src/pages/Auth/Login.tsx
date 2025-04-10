
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { LoginSyncComponent } from '@/components/sync';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(username, password, rememberMe);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl animate-fade-in">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
                alt="SmartM Logo" 
                className="h-24 w-auto"
              />
            </div>
            <CardTitle className="text-xl text-center font-semibold">Connexion</CardTitle>
            <CardDescription className="text-center">
              Accédez à votre compte pour gérer vos équipements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <GoogleAuthButton 
                onClick={handleGoogleAuth} 
                isLoading={isGoogleLoading}
                type="login"
              />
              
              <div className="relative flex items-center justify-center">
                <Separator className="my-2" />
                <span className="absolute bg-background px-2 text-xs text-muted-foreground">
                  ou connectez-vous avec vos identifiants
                </span>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => 
                      setRememberMe(checked === true)
                    }
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm text-right">
                  <Link to="/reset-password" className="text-primary hover:underline">
                    Mot de passe oublié?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Nouveau sur SmartM?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <LoginSyncComponent />
      </div>
    </div>
  );
};

export default Login;
