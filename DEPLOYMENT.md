# 🚀 Déploiement sur Azure App Service

## Prérequis

1. **Compte Azure** avec un abonnement actif
2. **Azure CLI** installé sur votre machine
3. **Git** configuré avec votre repository

## Option 1: Déploiement via Azure Portal (Recommandé)

### Étape 1: Créer l'App Service

1. Connectez-vous au [portail Azure](https://portal.azure.com)
2. Cliquez sur **"Créer une ressource"**
3. Recherchez **"App Service"** et cliquez sur **"Créer"**
4. Configurez:
   - **Nom**: `formations-app-[votre-nom]`
   - **Système d'exploitation**: Linux
   - **Runtime stack**: Node 18 LTS
   - **Région**: France Central (ou votre région préférée)
   - **Plan tarifaire**: B1 Basic (environ 13€/mois)

### Étape 2: Configurer le déploiement

1. Dans votre App Service, allez dans **"Centre de déploiement"**
2. Choisissez **"GitHub"** comme source
3. Autorisez Azure à accéder à votre repository GitHub
4. Sélectionnez votre repository et la branche `main`
5. Azure configurera automatiquement GitHub Actions

### Étape 3: Variables d'environnement

Dans **"Configuration"** > **"Paramètres d'application"**, ajoutez:
```
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=18-lts
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## Option 2: Déploiement via Azure CLI

### Installation et connexion
```bash
# Installer Azure CLI (si pas déjà fait)
# Windows: winget install Microsoft.AzureCLI
# macOS: brew install azure-cli

# Se connecter à Azure
az login

# Créer un groupe de ressources
az group create --name formations-rg --location "France Central"

# Créer un plan App Service
az appservice plan create --name formations-plan --resource-group formations-rg --sku B1 --is-linux

# Créer l'App Service
az webapp create --resource-group formations-rg --plan formations-plan --name formations-app-[votre-nom] --runtime "NODE|18-lts"
```

### Déploiement du code
```bash
# Dans le dossier formations-app
cd formations-app

# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Configurer le déploiement
az webapp deployment source config-local-git --name formations-app-[votre-nom] --resource-group formations-rg

# Ajouter Azure comme remote
git remote add azure https://formations-app-[votre-nom].scm.azurewebsites.net:443/formations-app-[votre-nom].git

# Déployer
git push azure main
```

## Configuration post-déploiement

### Variables d'environnement
```bash
az webapp config appsettings set --resource-group formations-rg --name formations-app-[votre-nom] --settings NODE_ENV=production WEBSITE_NODE_DEFAULT_VERSION=18-lts SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Redémarrer l'application
```bash
az webapp restart --resource-group formations-rg --name formations-app-[votre-nom]
```

## Vérification

1. Votre application sera disponible sur: `https://formations-app-[votre-nom].azurewebsites.net`
2. Testez l'API: `https://formations-app-[votre-nom].azurewebsites.net/api/health`

## Surveillance et logs

```bash
# Voir les logs en temps réel
az webapp log tail --resource-group formations-rg --name formations-app-[votre-nom]

# Télécharger les logs
az webapp log download --resource-group formations-rg --name formations-app-[votre-nom]
```

## Coûts estimés

- **Plan B1 Basic**: ~13€/mois
- **Bande passante**: Incluse (5 GB sortant)
- **Stockage**: Inclus (10 GB)

## Dépannage

### Problème: L'application ne démarre pas
```bash
# Vérifier les logs
az webapp log tail --resource-group formations-rg --name formations-app-[votre-nom]

# Vérifier la configuration
az webapp config show --resource-group formations-rg --name formations-app-[votre-nom]
```

### Problème: Base de données SQLite
La base de données SQLite sera recréée à chaque déploiement. Pour la persistance, considérez:
1. Azure Database for PostgreSQL (recommandé pour la production)
2. Azure Storage pour stocker le fichier SQLite
3. Azure Container Instances avec volume persistant
