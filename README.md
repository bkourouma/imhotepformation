# 🎓 IMHOTEP DATA - Plateforme de Formations

[![Azure Deployment](https://img.shields.io/badge/Azure-Deployed-blue?logo=microsoft-azure)](https://formations-app-container.azurewebsites.net)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)](https://sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://docker.com/)

Une plateforme moderne de gestion des formations professionnelles développée pour **IMHOTEP DATA**. Cette application full-stack permet aux entreprises de gérer leurs inscriptions aux formations, avec un panneau d'administration complet pour la gestion des formations et des statistiques.

## 🌐 Application en Ligne

**URL de Production :** [https://formations-app-container.azurewebsites.net](https://formations-app-container.azurewebsites.net)

### Accès Admin
- **URL :** [https://formations-app-container.azurewebsites.net/admin/login](https://formations-app-container.azurewebsites.net/admin/login)
- **Identifiants :** `admin` / `admin123`

## ✨ Fonctionnalités Principales

### 👥 Interface Utilisateur
- **Sélection d'entreprise** : Interface intuitive pour choisir ou créer une entreprise
- **Catalogue de formations** : Visualisation de toutes les formations disponibles
- **Inscription simplifiée** : Processus d'inscription en quelques clics
- **Tableau de bord** : Vue d'ensemble des inscriptions et statistiques
- **Design responsive** : Interface adaptée à tous les appareils

### 🔧 Panneau d'Administration
- **Gestion des formations** : CRUD complet (Créer, Lire, Modifier, Supprimer)
- **Gestion des entreprises** : Administration des entreprises clientes
- **Suivi des inscriptions** : Monitoring en temps réel des inscriptions
- **Statistiques avancées** : Tableaux de bord avec métriques détaillées
- **Authentification sécurisée** : Accès protégé par mot de passe

### 🎯 Fonctionnalités Métier
- **Isolation des données** : Chaque entreprise ne voit que ses propres données
- **Catalogue ouvert** : Toutes les formations sont visibles par tous
- **Persistance des données** : Base de données SQLite avec sauvegarde
- **Validation des données** : Contrôles de saisie côté client et serveur
- **Gestion des erreurs** : Messages d'erreur informatifs et gestion gracieuse

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend :** React 19.1.0 + Vite 6.3.5
- **Backend :** Node.js 20 + Express.js 4.21.2
- **Base de données :** SQLite 3 avec better-sqlite3
- **Styling :** Tailwind CSS 3.4.17
- **Déploiement :** Docker + Azure Container Registry + Azure App Service
- **Validation :** React Hook Form + Express Validator

### Architecture de Déploiement
```
Internet → Azure App Service → Docker Container → Node.js App
                                                ├── React Frontend (served from /dist)
                                                ├── Express.js API (/api/*)
                                                └── SQLite Database
```

## 📁 Structure du Projet

```
formations-app/
├── 📁 src/                          # Code source React
│   ├── 📁 components/               # Composants React réutilisables
│   │   ├── 📁 admin/               # Composants d'administration
│   │   ├── 📁 entreprises/         # Composants gestion entreprises
│   │   ├── 📁 formations/          # Composants gestion formations
│   │   ├── 📁 inscriptions/        # Composants gestion inscriptions
│   │   └── 📁 shared/              # Composants partagés (Sidebar, Layout, etc.)
│   ├── 📁 pages/                   # Pages principales de l'application
│   │   ├── 📁 admin/               # Pages d'administration
│   │   ├── 📁 entreprises/         # Pages entreprises
│   │   ├── 📁 formations/          # Pages formations
│   │   ├── 📁 inscriptions/        # Pages inscriptions
│   │   ├── CompanySelection.jsx    # Page sélection entreprise
│   │   └── Dashboard.jsx           # Tableau de bord principal
│   ├── 📁 hooks/                   # Hooks React personnalisés
│   │   ├── useAdminAuth.jsx        # Hook authentification admin
│   │   ├── useApi.js               # Hook API générique
│   │   └── useCompanySession.jsx   # Hook session entreprise
│   ├── 📁 services/                # Services et API
│   │   └── api.js                  # Configuration API Axios
│   ├── 📁 utils/                   # Utilitaires et helpers
│   │   └── helpers.js              # Fonctions utilitaires
│   ├── 📁 assets/                  # Ressources statiques
│   │   └── logo.png                # Logo IMHOTEP DATA
│   ├── App.jsx                     # Composant racine
│   ├── main.jsx                    # Point d'entrée React
│   └── index.css                   # Styles globaux
├── 📁 server/                      # Code source Backend
│   ├── 📁 database/                # Configuration base de données
│   │   ├── database.js             # Configuration SQLite
│   │   ├── formations.db           # Base de données SQLite
│   │   ├── 📁 migrations/          # Scripts de migration
│   │   └── 📁 seeders/             # Données de test
│   ├── 📁 models/                  # Modèles de données
│   │   ├── Entreprise.js           # Modèle Entreprise
│   │   ├── Formation.js            # Modèle Formation
│   │   └── Inscription.js          # Modèle Inscription
│   ├── 📁 routes/                  # Routes API Express
│   │   ├── dashboard.js            # Routes tableau de bord
│   │   ├── entreprises.js          # Routes entreprises
│   │   ├── formations.js           # Routes formations
│   │   └── inscriptions.js         # Routes inscriptions
│   └── server.js                   # Serveur Express principal
├── 📁 public/                      # Fichiers publics
├── 📁 dist/                        # Build de production React
├── Dockerfile                      # Configuration Docker
├── package.json                    # Dépendances et scripts
├── tailwind.config.js              # Configuration Tailwind CSS
├── vite.config.js                  # Configuration Vite
└── README.md                       # Documentation (ce fichier)
```

## 🚀 Installation et Développement

### Prérequis
- **Node.js** 20.x ou supérieur
- **npm** ou **yarn**
- **Git**

### Installation Locale

1. **Cloner le repository**
```bash
git clone <repository-url>
cd formations-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer en mode développement**
```bash
# Démarrer le serveur backend et frontend simultanément
npm run dev:full

# Ou séparément :
npm run server    # Backend sur http://localhost:3001
npm run dev       # Frontend sur http://localhost:5173
```

4. **Accéder à l'application**
- **Frontend :** http://localhost:5173
- **Backend API :** http://localhost:3001/api
- **Admin :** http://localhost:5173/admin/login

### Scripts Disponibles

```bash
npm run dev          # Démarrer Vite dev server (frontend uniquement)
npm run server       # Démarrer Express server (backend uniquement)
npm run dev:full     # Démarrer frontend + backend simultanément
npm run build        # Build de production React
npm run start        # Démarrer en mode production
npm run lint         # Linter ESLint
npm run preview      # Prévisualiser le build de production
```

## 🧪 Tests et Qualité

### Tests Manuels Recommandés

#### Tests Fonctionnels Utilisateur
1. **Sélection d'entreprise**
   - Créer une nouvelle entreprise
   - Sélectionner une entreprise existante
   - Vérifier la persistance de la sélection

2. **Gestion des formations**
   - Visualiser le catalogue des formations
   - Filtrer et rechercher des formations
   - Consulter les détails d'une formation

3. **Inscriptions**
   - S'inscrire à une formation
   - Voir ses inscriptions dans le tableau de bord
   - Vérifier l'isolation des données par entreprise

#### Tests Administrateur
1. **Authentification**
   - Connexion avec identifiants corrects
   - Tentative avec identifiants incorrects
   - Déconnexion et redirection

2. **CRUD Formations**
   - Créer une nouvelle formation
   - Modifier une formation existante
   - Supprimer une formation
   - Validation des champs obligatoires

3. **Gestion des données**
   - Consulter les statistiques
   - Exporter les données
   - Vérifier l'intégrité des données

### Tests API

#### Endpoints Principaux
```bash
# Test de santé de l'API
curl https://formations-app-container.azurewebsites.net/api/health

# Récupérer toutes les formations
curl https://formations-app-container.azurewebsites.net/api/formations

# Récupérer les entreprises
curl https://formations-app-container.azurewebsites.net/api/entreprises

# Statistiques du tableau de bord
curl https://formations-app-container.azurewebsites.net/api/dashboard/stats
```

### Validation de la Qualité du Code
```bash
# Linting ESLint
npm run lint

# Vérification des dépendances
npm audit

# Analyse de la taille du bundle
npm run build
```

## 🐳 Déploiement Docker

### Build Local
```bash
# Construire l'image Docker
docker build -t formations-app .

# Lancer le conteneur
docker run -p 3001:3001 formations-app

# Accéder à l'application
open http://localhost:3001
```

### Configuration Docker

Le `Dockerfile` utilise une approche multi-stage pour optimiser la taille et la sécurité :

```dockerfile
# Stage 1: Build
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S formations -u 1001
RUN chown -R formations:nodejs /app
USER formations

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
```

### Fonctionnalités Docker
- **Multi-stage build** pour optimiser la taille
- **Utilisateur non-root** pour la sécurité
- **Health check** intégré
- **Variables d'environnement** configurables
- **Port 3001** exposé

## ☁️ Déploiement Azure

### Architecture Azure

L'application est déployée sur **Microsoft Azure** avec l'architecture suivante :

```
Azure Resource Group: formations-rg
├── Azure Container Registry (ACR): formationsacr.azurecr.io
├── Azure App Service: formations-app-container
└── Container Image: formations-app:v6
```

### Ressources Azure Configurées

#### 1. Azure Container Registry (ACR)
- **Nom :** `formationsacr`
- **URL :** `formationsacr.azurecr.io`
- **SKU :** Basic
- **Authentification :** Admin activée

#### 2. Azure App Service
- **Nom :** `formations-app-container`
- **Plan :** Linux Container
- **Runtime :** Docker Container
- **URL :** https://formations-app-container.azurewebsites.net

### Variables d'Environnement Azure

```bash
WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
DOCKER_REGISTRY_SERVER_URL=https://formationsacr.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME=formationsacr
DOCKER_CUSTOM_IMAGE_NAME=DOCKER|formationsacr.azurecr.io/formations-app:v6
```

### Procédure de Déploiement

#### Prérequis
- **Azure CLI** installé et configuré
- **Docker** installé (optionnel pour build local)
- **Accès** au resource group `formations-rg`

#### Étapes de Déploiement

1. **Préparer les changements**
```bash
# Ajouter les fichiers modifiés
git add .

# Commiter les changements
git commit -m "Description des modifications"
```

2. **Build et Push vers ACR**
```bash
# Build automatique dans Azure Container Registry
az acr build --registry formationsacr --image formations-app:v[VERSION] .
```

3. **Mettre à jour l'App Service**
```bash
# Configurer la nouvelle image
az webapp config container set \
  --name formations-app-container \
  --resource-group formations-rg \
  --container-image-name formationsacr.azurecr.io/formations-app:v[VERSION]

# Redémarrer l'application
az webapp restart \
  --name formations-app-container \
  --resource-group formations-rg
```

4. **Vérifier le déploiement**
```bash
# Test de santé de l'API
curl https://formations-app-container.azurewebsites.net/api/health

# Vérifier les logs
az webapp log tail \
  --name formations-app-container \
  --resource-group formations-rg
```

### Script de Déploiement Automatisé

```bash
#!/bin/bash
# deploy.sh - Script de déploiement automatisé

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./deploy.sh v[NUMBER]"
  exit 1
fi

echo "🚀 Déploiement de la version $VERSION"

# 1. Commit des changements
git add .
git commit -m "Déploiement version $VERSION"

# 2. Build dans ACR
echo "📦 Build de l'image Docker..."
az acr build --registry formationsacr --image formations-app:$VERSION .

# 3. Mise à jour App Service
echo "🔄 Mise à jour de l'App Service..."
az webapp config container set \
  --name formations-app-container \
  --resource-group formations-rg \
  --container-image-name formationsacr.azurecr.io/formations-app:$VERSION

# 4. Redémarrage
echo "🔄 Redémarrage de l'application..."
az webapp restart \
  --name formations-app-container \
  --resource-group formations-rg

# 5. Attendre et tester
echo "⏳ Attente du redémarrage..."
sleep 45

echo "🧪 Test de santé..."
curl -f https://formations-app-container.azurewebsites.net/api/health

echo "✅ Déploiement terminé !"
echo "🌐 Application disponible : https://formations-app-container.azurewebsites.net"
```

### Monitoring et Logs

```bash
# Consulter les logs en temps réel
az webapp log tail --name formations-app-container --resource-group formations-rg

# Télécharger les logs
az webapp log download --name formations-app-container --resource-group formations-rg

# Métriques de l'application
az monitor metrics list --resource formations-app-container --resource-group formations-rg
```

## 📊 API Documentation

### Endpoints Principaux

#### Santé de l'API
```http
GET /api/health
```
**Réponse :**
```json
{
  "status": "OK",
  "message": "API Formations en fonctionnement",
  "environment": "production",
  "timestamp": "2025-07-04T06:42:26.365Z",
  "version": "1.0.0"
}
```

#### Formations
```http
GET    /api/formations              # Lister toutes les formations
POST   /api/formations              # Créer une formation (admin)
GET    /api/formations/:id          # Détails d'une formation
PUT    /api/formations/:id          # Modifier une formation (admin)
DELETE /api/formations/:id          # Supprimer une formation (admin)
```

#### Entreprises
```http
GET    /api/entreprises             # Lister toutes les entreprises
POST   /api/entreprises             # Créer une entreprise
GET    /api/entreprises/:id         # Détails d'une entreprise
PUT    /api/entreprises/:id         # Modifier une entreprise
```

#### Inscriptions
```http
GET    /api/inscriptions            # Lister les inscriptions (filtrées par entreprise)
POST   /api/inscriptions            # Créer une inscription
GET    /api/inscriptions/:id        # Détails d'une inscription
DELETE /api/inscriptions/:id        # Supprimer une inscription
```

#### Tableau de Bord
```http
GET    /api/dashboard/stats         # Statistiques générales
GET    /api/dashboard/stats/:entrepriseId  # Statistiques par entreprise
```

### Modèles de Données

#### Formation
```json
{
  "id": 1,
  "titre": "Formation React Avancé",
  "description": "Maîtrisez React et ses concepts avancés",
  "duree": "3 jours",
  "prix": 1500.00,
  "date_debut": "2025-08-15",
  "date_fin": "2025-08-17",
  "lieu": "Paris",
  "max_participants": 20,
  "created_at": "2025-07-04T10:00:00.000Z",
  "updated_at": "2025-07-04T10:00:00.000Z"
}
```

#### Entreprise
```json
{
  "id": 1,
  "nom": "IMHOTEP DATA",
  "secteur": "Technologie",
  "taille": "PME",
  "adresse": "123 Rue de la Tech, Paris",
  "contact_email": "contact@imhotepdata.com",
  "contact_telephone": "+33 1 23 45 67 89",
  "created_at": "2025-07-04T10:00:00.000Z",
  "updated_at": "2025-07-04T10:00:00.000Z"
}
```

#### Inscription
```json
{
  "id": 1,
  "formation_id": 1,
  "entreprise_id": 1,
  "nom_participant": "Jean Dupont",
  "email_participant": "jean.dupont@imhotepdata.com",
  "telephone_participant": "+33 6 12 34 56 78",
  "statut": "confirmee",
  "date_inscription": "2025-07-04T10:00:00.000Z",
  "created_at": "2025-07-04T10:00:00.000Z",
  "updated_at": "2025-07-04T10:00:00.000Z"
}
```

## 🗄️ Base de Données

### Configuration SQLite

La base de données utilise **SQLite 3** avec **better-sqlite3** pour les performances optimales.

**Fichier :** `server/database/formations.db`

### Schéma de Base de Données

```sql
-- Table des formations
CREATE TABLE formations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    duree TEXT,
    prix DECIMAL(10,2),
    date_debut DATE,
    date_fin DATE,
    lieu TEXT,
    max_participants INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE entreprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE,
    secteur TEXT,
    taille TEXT,
    adresse TEXT,
    contact_email TEXT,
    contact_telephone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des inscriptions
CREATE TABLE inscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formation_id INTEGER NOT NULL,
    entreprise_id INTEGER NOT NULL,
    nom_participant TEXT NOT NULL,
    email_participant TEXT NOT NULL,
    telephone_participant TEXT,
    statut TEXT DEFAULT 'en_attente',
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
);
```

### Sauvegarde et Restauration

```bash
# Sauvegarde de la base de données
cp server/database/formations.db backup/formations_$(date +%Y%m%d_%H%M%S).db

# Restauration
cp backup/formations_YYYYMMDD_HHMMSS.db server/database/formations.db
```

## 🔧 Configuration et Variables d'Environnement

### Variables d'Environnement

```bash
# Production
NODE_ENV=production
PORT=3001

# Base de données
DB_PATH=./server/database/formations.db

# Sécurité (optionnel)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS (optionnel)
CORS_ORIGIN=*
```

### Configuration Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          500: '#f97316',  // Orange IMHOTEP DATA
          600: '#ea580c',
          700: '#c2410c',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Configuration Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    }
  }
})
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. Erreur de Connexion à la Base de Données
```bash
# Vérifier les permissions du fichier
ls -la server/database/formations.db

# Recréer la base de données si nécessaire
rm server/database/formations.db
npm run server  # Recrée automatiquement la DB
```

#### 2. Erreur de Build Docker
```bash
# Nettoyer le cache Docker
docker system prune -a

# Rebuild sans cache
docker build --no-cache -t formations-app .
```

#### 3. Problème de Routage React
```bash
# Vérifier la configuration du serveur
# Le serveur doit servir index.html pour toutes les routes non-API
```

#### 4. Erreur de Déploiement Azure
```bash
# Vérifier les logs Azure
az webapp log tail --name formations-app-container --resource-group formations-rg

# Redémarrer l'App Service
az webapp restart --name formations-app-container --resource-group formations-rg
```

### Logs et Debugging

```bash
# Logs locaux
npm run server  # Logs du serveur Express

# Logs Azure
az webapp log tail --name formations-app-container --resource-group formations-rg

# Debug mode (local)
DEBUG=* npm run server
```

## 🤝 Contribution

### Workflow de Développement

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. **Pousser** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Créer** une Pull Request

### Standards de Code

- **ESLint** : Respecter la configuration ESLint
- **Prettier** : Formatage automatique du code
- **Commits** : Messages descriptifs en français
- **Tests** : Tester manuellement toutes les fonctionnalités

### Structure des Commits

```
type(scope): description

feat(formations): ajout du système de filtrage
fix(api): correction de la validation des emails
docs(readme): mise à jour de la documentation
style(ui): amélioration du design responsive
refactor(database): optimisation des requêtes
```

## 📞 Support et Contact

### Équipe de Développement
- **Entreprise :** IMHOTEP DATA
- **Projet :** Plateforme de Formations
- **Version :** 1.0.0

### Ressources Utiles
- **Application :** https://formations-app-container.azurewebsites.net
- **Admin :** https://formations-app-container.azurewebsites.net/admin/login
- **API Health :** https://formations-app-container.azurewebsites.net/api/health

### Technologies Documentées
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Docker Documentation](https://docs.docker.com/)

---

**© 2025 IMHOTEP DATA - Plateforme de Formations Professionnelles**

*Développé avec ❤️ en React, Express.js et déployé sur Microsoft Azure*
