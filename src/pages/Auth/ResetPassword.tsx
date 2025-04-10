
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordWithToken } from "@/services/auth";
import { getStorage } from '@/utils/sqliteStorage';

const storage = getStorage();

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Vérifier si un token est présent
    if (!token) {
      toast({
        title: "Erreur",
        description: "Aucun token de réinitialisation fourni",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      // Ici, nous pourrions vérifier la validité du token
      setTokenValid(true);
    }
  }, [token, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (token) {
        const success = await resetPasswordWithToken(token, password);
        
        if (success) {
          toast({
            title: "Succès",
            description: "Votre mot de passe a été réinitialisé avec succès",
          });
          navigate("/login");
        } else {
          toast({
            title: "Erreur",
            description: "Le lien de réinitialisation est invalide ou a expiré",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation du mot de passe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Réinitialisation du mot de passe</CardTitle>
            <CardDescription>Vérification du token...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réinitialisation du mot de passe</CardTitle>
          <CardDescription>Veuillez entrer votre nouveau mot de passe</CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
