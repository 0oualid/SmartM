import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Lightbulb, 
  Target, 
  Award, 
  Layers, 
  Users, 
  Code, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  Database, 
  Shield,
  Cpu,
  DollarSign,
  CheckSquare
} from 'lucide-react';

const About = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">À propos de SmartM</h1>
          <p className="text-muted-foreground">Découvrez notre solution innovante de gestion</p>
        </div>
      </header>
      
      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="bg-primary h-32 flex items-center justify-center">
            <div className="flex items-center justify-center bg-white rounded-full p-4">
              <img 
                src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
                alt="SmartM Logo" 
                className="h-20 w-auto"
              />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Smart Management</CardTitle>
            <CardDescription className="text-center">
              La solution complète pour la gestion de votre entité
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6">
            <p className="text-muted-foreground">
              SmartM est une application conçue pour faciliter la gestion des entités et services en permettant aux managers 
              d'assurer un suivi optimal des équipements, des finances, du personnel et des tâches.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Notre Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Fournir une solution intuitive et complète permettant aux managers de superviser efficacement leurs ressources 
                et d'optimiser la performance opérationnelle de leurs équipes.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Notre Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Transformer la manière dont les organisations gèrent leurs ressources en offrant des outils numériques 
                accessibles qui favorisent l'efficacité et la prise de décisions éclairées.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Fonctionnalités Principales</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-secondary/20 p-4 rounded-lg flex flex-col items-center text-center">
                <Cpu className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Gestion des Équipements</h3>
                <p className="text-sm text-muted-foreground">Suivez l'état et la disponibilité de tous vos équipements</p>
              </div>
              
              <div className="bg-secondary/20 p-4 rounded-lg flex flex-col items-center text-center">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Gestion du Personnel</h3>
                <p className="text-sm text-muted-foreground">Gérez les effectifs et les indisponibilités efficacement</p>
              </div>
              
              <div className="bg-secondary/20 p-4 rounded-lg flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Gestion des Finances</h3>
                <p className="text-sm text-muted-foreground">Suivez et analysez vos dépenses en toute simplicité</p>
              </div>
              
              <div className="bg-secondary/20 p-4 rounded-lg flex flex-col items-center text-center">
                <CheckSquare className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Gestion des Tâches</h3>
                <p className="text-sm text-muted-foreground">Assignez et suivez l'avancement des tâches de votre équipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Spécifications Techniques</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Compatibilité</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Application compatible avec Android et iOS pour une utilisation mobile optimale.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Technologies</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Développée avec React pour le frontend et Node.js pour le backend.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Stockage</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Utilise SQLite pour le stockage local et PostgreSQL pour l'authentification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Sécurité et Confidentialité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              Chez SmartM, nous prenons la sécurité et la confidentialité de vos données très au sérieux. 
              Notre application est conçue avec les meilleures pratiques de sécurité, assurant que vos informations 
              sensibles restent protégées. Toutes les données sont chiffrées et sauvegardées de manière sécurisée.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Support et Assistance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              Notre équipe de support est disponible pour vous aider avec toutes vos questions ou préoccupations.
              N'hésitez pas à nous contacter via le formulaire de contact ou par email.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              © 2024 SmartM. Tous droits réservés.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default About;
