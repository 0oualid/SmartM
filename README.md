
# Smart-M: Application de Gestion Mobile

## À propos du projet

Smart-M est une application mobile de gestion destinée à suivre les équipements, le personnel, les finances et les tâches. Elle est optimisée pour les appareils mobiles et peut être déployée sur iOS et Android grâce à Capacitor.

URL du projet: https://lovable.dev/projects/e40b4ce4-afc7-482d-b92e-15182847bc82

## Structure du projet

```
smart-m/
├── capacitor.config.ts                # Configuration Capacitor pour les fonctionnalités natives
├── components.json                    # Configuration des composants shadcn/ui
├── index.html                         # Point d'entrée HTML de l'application
├── package.json                       # Dépendances et scripts npm
├── postcss.config.js                  # Configuration PostCSS pour Tailwind
├── public/                            # Ressources publiques
│   ├── favicon.ico                    # Icône du site
│   ├── lovable-uploads/               # Images téléchargées
│   ├── robots.txt                     # Configuration pour les robots d'indexation
│   ├── smartm-logo-fallback.svg       # Logo de secours
│   └── smartm-logo.png                # Logo principal
├── src/                               # Code source de l'application
│   ├── App.css                        # Styles CSS globaux
│   ├── App.tsx                        # Composant racine avec les routes
│   ├── README.md                      # Documentation interne
│   ├── __tests__/                     # Tests unitaires
│   ├── components/                    # Composants réutilisables
│   │   ├── CategoryFilter.tsx         # Filtre par catégorie
│   │   ├── Dialogs/                   # Dialogues et modales
│   │   │   └── DialogAddTask.tsx      # Dialogue d'ajout de tâche
│   │   ├── Layout/                    # Composants de mise en page
│   │   │   ├── Layout.tsx             # Layout général
│   │   │   └── MobileLayout.tsx       # Layout optimisé pour mobile
│   │   ├── auth/                      # Composants d'authentification
│   │   │   └── GoogleAuthButton.tsx   # Bouton d'authentification Google
│   │   ├── sync/                      # Composants de synchronisation
│   │   │   ├── LoginPageSync.tsx      # Synchro sur page de connexion
│   │   │   ├── LoginSyncComponent.tsx # Composant de synchro à la connexion
│   │   │   ├── SyncIndicator.tsx      # Indicateur de synchronisation
│   │   │   ├── SyncSettings.tsx       # Paramètres de synchronisation
│   │   │   ├── SyncStatus.tsx         # Statut de synchronisation
│   │   │   └── index.ts               # Export des composants de synchro
│   │   └── ui/                        # Composants UI de base (shadcn/ui)
│   │       ├── accordion.tsx          # Accordéon
│   │       ├── alert-dialog.tsx       # Dialogue d'alerte
│   │       ├── alert.tsx              # Alerte
│   │       ├── aspect-ratio.tsx       # Ratio d'aspect
│   │       ├── avatar.tsx             # Avatar
│   │       ├── badge.tsx              # Badge
│   │       ├── ...                    # Autres composants UI
│   ├── contexts/                      # Contextes React
│   │   └── LanguageContext.tsx        # Contexte de langue
│   ├── hooks/                         # Hooks personnalisés
│   │   ├── use-mobile.tsx             # Hook de détection mobile
│   │   ├── use-platform.ts            # Hook de détection de plateforme
│   │   ├── use-toast.ts               # Hook pour les notifications toast
│   │   ├── useAuth.tsx                # Hook d'authentification
│   │   └── useSync.tsx                # Hook de synchronisation
│   ├── index.css                      # Styles CSS globaux
│   ├── lib/                           # Bibliothèques et utilitaires
│   │   └── utils.ts                   # Fonctions utilitaires générales
│   ├── main.tsx                       # Point d'entrée JavaScript
│   ├── pages/                         # Pages de l'application
│   │   ├── About/                     # Page À propos
│   │   │   └── About.tsx              # Composant À propos
│   │   ├── Auth/                      # Pages d'authentification
│   │   │   ├── Login.tsx              # Page de connexion
│   │   │   ├── Register.tsx           # Page d'inscription
│   │   │   └── ResetPassword.tsx      # Réinitialisation de mot de passe
│   │   ├── Consumption/               # Module de consommation financière
│   │   │   └── ConsumptionList.tsx    # Liste des consommations
│   │   ├── Contact/                   # Page de contact
│   │   │   └── Contact.tsx            # Composant de contact
│   │   ├── Dashboard/                 # Tableau de bord
│   │   │   └── Dashboard.tsx          # Page principale du tableau de bord
│   │   ├── Equipment/                 # Module d'équipements
│   │   │   ├── EquipmentDetail.tsx    # Détail d'un équipement
│   │   │   └── EquipmentList.tsx      # Liste des équipements
│   │   ├── Index.tsx                  # Page d'accueil
│   │   ├── NotFound.tsx               # Page 404
│   │   ├── Notifications/             # Module de notifications
│   │   │   └── NotificationsList.tsx  # Liste des notifications
│   │   ├── Personnel/                 # Module de personnel
│   │   │   └── PersonnelList.tsx      # Liste du personnel
│   │   ├── Profile/                   # Profil utilisateur
│   │   │   └── Profile.tsx            # Page de profil
│   │   ├── Report/                    # Module de génération de rapports
│   │   │   ├── ReportGenerator.tsx    # Générateur de rapports
│   │   │   ├── components/            # Composants pour les rapports
│   │   │   ├── hooks/                 # Hooks pour les rapports
│   │   │   └── utils/                 # Utilitaires pour les rapports
│   │   └── Tasks/                     # Module de gestion des tâches
│   │       ├── TasksList.tsx          # Liste des tâches
│   │       └── components/            # Composants pour les tâches
│   │           ├── CategoryBadge.tsx  # Badge de catégorie
│   │           ├── DeleteInstanceDialog.tsx # Dialogue de suppression
│   │           ├── EditInstanceSheet.tsx    # Feuille d'édition
│   │           ├── InstanceActions.tsx      # Actions sur instance
│   │           ├── InstanceStatusBadge.tsx  # Badge de statut
│   │           ├── InstancesSummary.tsx     # Résumé des instances
│   │           ├── InstancesTable.tsx       # Tableau des instances
│   │           ├── SearchAndFilter.tsx      # Recherche et filtre
│   │           └── TasksHeader.tsx          # En-tête des tâches
│   ├── server/                        # Serveur et base de données
│   │   ├── db.ts                      # Configuration de la base de données
│   │   └── server.ts                  # Serveur Express
│   ├── services/                      # Services pour accéder aux données
│   │   ├── auth/                      # Services d'authentification
│   │   │   ├── authCore.ts            # Logique d'authentification
│   │   │   ├── index.ts               # Export des services d'auth
│   │   │   ├── migrationService.ts    # Migration des données d'auth
│   │   │   ├── passwordService.ts     # Gestion des mots de passe
│   │   │   └── types.ts               # Types pour l'authentification
│   │   ├── consumptionService.ts      # Service de consommation financière
│   │   ├── emailService.ts            # Service d'emails
│   │   ├── equipment/                 # Services d'équipements
│   │   ├── equipmentFailure/          # Services d'avaries d'équipements
│   │   ├── equipmentFailureService.ts # Service d'avaries (ancien)
│   │   ├── equipmentService.ts        # Service d'équipements (ancien)
│   │   ├── migrationService.ts        # Service de migration des données
│   │   ├── notificationService.ts     # Service de notifications
│   │   ├── personnelService.ts        # Service de personnel
│   │   └── taskService.ts             # Service de tâches
│   ├── setupTests.ts                  # Configuration des tests
│   ├── utils/                         # Utilitaires
│   │   ├── capacitorUtils.ts          # Utilitaires pour Capacitor
│   │   ├── localStorageService.ts     # Service localStorage
│   │   ├── notificationUtils.ts       # Utilitaires de notification
│   │   ├── pdf/                       # Génération de PDF
│   │   │   ├── equipmentReportGenerator.ts # Générateur de rapport d'équipement
│   │   │   ├── helpers.ts             # Helpers pour PDF
│   │   │   ├── sections/              # Sections du rapport PDF
│   │   │   └── systemReportGenerator.ts # Générateur de rapport système
│   │   ├── pdfUtils.ts                # Utilitaires PDF généraux
│   │   ├── personnelUtils.ts          # Utilitaires pour le personnel
│   │   ├── sqliteStorage.ts           # Stockage SQLite
│   │   ├── syncUtils.ts               # Utilitaires de synchronisation
│   │   ├── taskUtils.ts               # Utilitaires pour les tâches
│   │   └── types.ts                   # Types partagés
│   └── vite-env.d.ts                  # Types d'environnement Vite
├── tailwind.config.ts                 # Configuration Tailwind CSS
├── tsconfig.app.json                  # Configuration TypeScript pour l'app
├── tsconfig.json                      # Configuration TypeScript principale
├── tsconfig.node.json                 # Configuration TypeScript pour Node
└── vite.config.ts                     # Configuration Vite
```

## Fonctionnalités principales

### 1. Gestion des équipements
- Liste des équipements avec recherche et filtrage
- Détails des équipements avec historique des avaries
- Suivi de l'état opérationnel des équipements

### 2. Gestion du personnel
- Liste du personnel avec informations détaillées
- Suivi des absences et des permissions
- Statistiques de présence et d'absence

### 3. Suivi financier
- Suivi des consommations financières par mois
- Visualisation des dépenses par catégorie
- Exportation des données financières

### 4. Gestion des tâches
- Création, édition et suppression de tâches
- Assignation de tâches à des membres du personnel
- Suivi de l'état d'avancement des tâches
- Filtrage par catégorie et statut

### 5. Génération de rapports
- Création de rapports PDF compilant les données des différents modules
- Sélection des domaines à inclure dans le rapport
- Personnalisation des rapports par période

### 6. Fonctionnalités mobiles
- Interface optimisée pour les appareils mobiles
- Synchronisation des données entre appareils
- Notifications push
- Mode hors ligne avec synchronisation ultérieure

## Technologies utilisées

- **Frontend** : React, TypeScript, Tailwind CSS, shadcn/ui
- **Outils de build** : Vite, PostCSS
- **Mobile** : Capacitor pour les fonctionnalités natives iOS/Android
- **Stockage** : LocalStorage, SQLite (via Capacitor)
- **Génération de PDF** : jsPDF
- **Tests** : Jest, React Testing Library

## Architecture de l'application

L'application suit une architecture modulaire avec séparation des préoccupations :

- **Composants UI** : Interface utilisateur réutilisable (src/components)
- **Pages** : Écrans principaux de l'application (src/pages)
- **Services** : Logique métier et accès aux données (src/services)
- **Hooks** : Logique réutilisable pour les composants (src/hooks)
- **Contextes** : État global partagé (src/contexts)
- **Utilitaires** : Fonctions d'aide partagées (src/utils)

## Comment éditer ce code ?

### Utiliser Lovable

Visitez simplement le [Projet Lovable](https://lovable.dev/projects/e40b4ce4-afc7-482d-b92e-15182847bc82) et commencez à formuler vos requêtes.

Les modifications effectuées via Lovable seront automatiquement commises dans ce dépôt.

### Utiliser votre IDE préféré

Si vous souhaitez travailler localement en utilisant votre propre IDE, vous pouvez cloner ce dépôt et pousser les modifications. Les modifications poussées seront également reflétées dans Lovable.

La seule exigence est d'avoir Node.js et npm installés - [installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Suivez ces étapes :

```sh
# Étape 1 : Clonez le dépôt en utilisant l'URL Git du projet.
git clone <VOTRE_URL_GIT>

# Étape 2 : Naviguez vers le répertoire du projet.
cd <NOM_DE_VOTRE_PROJET>

# Étape 3 : Installez les dépendances nécessaires.
npm i

# Étape 4 : Démarrez le serveur de développement avec rechargement automatique et un aperçu instantané.
npm run dev
```

## Compilation pour les plateformes mobiles

Pour compiler l'application pour iOS ou Android :

```sh
# Construction de l'application web
npm run build

# Synchronisation avec les plateformes natives
npx cap sync

# Ouverture du projet dans Xcode (iOS)
npx cap open ios

# Ouverture du projet dans Android Studio
npx cap open android
```

## Contribution au projet

1. Forker le dépôt
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence privée. Tous droits réservés.
