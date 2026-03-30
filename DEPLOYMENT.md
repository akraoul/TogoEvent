# TogoEvents - Configuration pour le déploiement sur Vercel

## 📋 Prérequis

- Compte Vercel (https://vercel.com)
- Dépôt GitHub connecté à Vercel
- Variables d'environnement configurées

## 🚀 Déploiement

### 1. Connexion à Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login
```

### 2. Configuration du projet

```bash
# Lier le projet au dépôt
vercel link

# Configurer les variables d'environnement
vercel env add NODE_ENV production
vercel env add JWT_SECRET production
vercel env add REACT_APP_API_URL production
```

### 3. Déploiement

```bash
# Déployer
vercel --prod
```

## 🔧 Configuration spécifique

### Variables d'environnement requises

- `NODE_ENV=production`
- `JWT_SECRET=votre-clé-secrète`
- `REACT_APP_API_URL=/api`

### Architecture Vercel

- **Frontend**: React build statique
- **Backend**: Serverless Functions dans `/api`
- **Base de données**: SQLite dans `/tmp` (Vercel)

### Limitations connues

- **Base de données**: SQLite est temporaire sur Vercel, les données sont perdues au redémarrage
- **Performance**: Les fonctions serverless ont un timeout de 10 secondes
- **Concurrence**: Limitations sur les accès simultanés à la base de données

## 📊 Monitoring

- Vercel Analytics pour les performances
- Logs disponibles dans le dashboard Vercel
- Health check disponible sur `/api/health`

## 🔄 Pour la production

Pour une utilisation en production, il est recommandé de:

1. **Migrer vers une base de données persistante** (PostgreSQL, MongoDB)
2. **Utiliser un service externe** pour la base de données
3. **Configurer un CDN** pour les assets statiques
4. **Mettre en place des logs structurés**

## 🐛 Débogage

En cas de problème:

1. Vérifier les logs dans le dashboard Vercel
2. Tester les fonctions API localement avec `vercel dev`
3. Valider les variables d'environnement
4. Vérifier la configuration CORS
