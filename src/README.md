
# Documentation des composants Smart-M

Ce dossier contient le code source de l'application Smart-M, une application de gestion destinée à suivre les équipements, le personnel, les finances et les tâches.

## Organisation du projet

- `components/`: Composants UI partagés (boutons, cartes, etc.)
- `contexts/`: Contextes React pour la gestion d'état globale
- `hooks/`: Hooks personnalisés
- `pages/`: Composants de pages organisés par domaine fonctionnel
- `services/`: Services pour accéder aux données et effectuer des opérations
- `utils/`: Fonctions utilitaires partagées

## Module de génération de rapports

Le module de génération de rapports permet de créer des rapports PDF qui compilent les informations des différents domaines de l'application (équipements, personnel, finances, tâches).

### Composants et fonctionnalités

- `ReportGenerator`: Page principale pour générer des rapports
- `ReportGeneratorCard`: Carte contenant les options de génération de rapport
- `DomainCheckboxes`: Permet de sélectionner les domaines à inclure
- `MonthSelector`: Permet de sélectionner le mois pour les données financières
- `ActionButtons`: Boutons pour générer et télécharger/imprimer le rapport

### Hooks

- `useReportGenerator`: Gère la logique de génération de rapports

### Utilitaires

- `reportGenerationUtils.ts`: Fonctions pour créer les différentes sections du rapport PDF

## Module d'équipements

Le module d'équipements permet de gérer les équipements et leurs avaries.

### Composants et fonctionnalités

- `EquipmentList`: Liste des équipements
- `EquipmentDetail`: Détails d'un équipement et gestion des avaries
- `EquipmentFailure`: Gestion des avaries d'équipement

### Services

- `equipmentService.ts`: Service pour accéder aux données des équipements
- `equipmentFailureService.ts`: Service pour gérer les avaries d'équipement

## Génération de PDF

L'application utilise la bibliothèque jsPDF pour générer des rapports PDF. Les fonctions sont regroupées dans les modules suivants:

- `utils/pdfUtils.ts`: Fonctions de base pour la génération de PDF
- `utils/pdf/helpers.ts`: Fonctions utilitaires pour la génération de PDF
- `utils/pdf/sections/`: Génération des différentes sections du rapport

## Utilisation du stockage local

L'application utilise le localStorage du navigateur pour stocker les données:

- Équipements et avaries
- Personnel et absences
- Consommations financières
- Tâches et instances

Les services correspondants fournissent des fonctions pour accéder à ces données.

## Architecture d'interface utilisateur

L'application utilise:
- **Shadcn/UI**: Bibliothèque de composants React
- **Tailwind CSS**: Framework CSS utilitaire
- **Lucide React**: Icônes SVG
