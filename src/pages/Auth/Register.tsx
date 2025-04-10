
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getStorage } from '@/utils/sqliteStorage';
import { useAuth } from '@/hooks/useAuth';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { Separator } from '@/components/ui/separator';

const storage = getStorage();
const API_BASE_URL = 'https://5b28-105-71-18-95.ngrok-free.app/api';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Inscription réussie",
          description: "Vous pouvez maintenant vous connecter",
          variant: "success", 
        });
        navigate('/login');
      } else {
        toast({
          title: "Erreur d'inscription",
          description: data.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      
      // Mode dégradé pour la démo
      toast({
        title: "Service indisponible",
        description: "Inscription simulée réussie",
        variant: "default",
      });
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté avec Google",
          variant: "success"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification Google", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
              alt="SmartM Logo" 
              className="h-24 w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GoogleAuthButton 
              onClick={handleGoogleAuth} 
              isLoading={isGoogleLoading}
              type="register"
            />
            
            <div className="relative flex items-center justify-center">
              <Separator className="my-4" />
              <span className="absolute bg-background px-2 text-xs text-muted-foreground">
                ou inscrivez-vous avec un email
              </span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="username"
                    value={registerData.username}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={handleChange}
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

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
