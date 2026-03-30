# 🎭 TogoEvents Backend API

**N°1 de la billetterie événementielle culturelle au Togo**

Backend API Node.js + Express + SQLite pour la plateforme TogoEvents.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 16+ 
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Ou en mode développement
npm run dev
```

### Serveur
- **URL**: http://localhost:8000
- **API**: http://localhost:8000/api/events
- **Health**: http://localhost:8000/api/health

## 📚 Documentation API

### Endpoints

#### 🎭 Événements
- `GET /api/events` - Lister tous les événements publiés
- `POST /api/events` - Créer un nouvel événement
- `GET /api/events/:id` - Détails d'un événement
- `PUT /api/events/:id` - Mettre à jour un événement (bientôt)
- `DELETE /api/events/:id` - Supprimer un événement (bientôt)

#### 🏷️ Catégories
- `GET /api/categories` - Lister toutes les catégories

#### 🏙️ Villes
- `GET /api/cities` - Lister toutes les villes

#### 🏛️ Lieux
- `GET /api/venues` - Lister tous les lieux
- `GET /api/venues?city_id=:id` - Lieux par ville

### Créer un Événement

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concert de Test",
    "shortDescription": "Description courte",
    "categoryId": "1",
    "venueName": "Palais des Congrès",
    "venueAddress": "Place de l\'Indépendance, Lomé",
    "startDate": "2024-12-25T19:00:00",
    "endDate": "2024-12-25T23:00:00",
    "isFree": false,
    "minPrice": 5000,
    "maxPrice": 15000,
    "totalCapacity": 500,
    "ticketTypes": [
      {
        "name": "Standard",
        "price": 5000,
        "quantity": 300
      },
      {
        "name": "VIP",
        "price": 15000,
        "quantity": 200
      }
    ],
    "isFeatured": true,
    "isPromo": false
  }'
```

**Réponse**:
```json
{
  "id": "uuid-generated",
  "message": "Événement créé avec succès",
  "status": "published",
  "slug": "concert-de-test"
}
```

## 🗄️ Base de Données

### SQLite
- **Fichier**: `togoevents.db`
- **Tables**: `events`, `categories`, `cities`, `venues`, `ticket_types`

### Structure
```sql
-- Événements
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id TEXT,
  venue_id TEXT,
  venue_name TEXT,
  venue_address TEXT,
  start_date DATETIME,
  end_date DATETIME,
  is_free BOOLEAN DEFAULT 0,
  min_price REAL DEFAULT 0,
  max_price REAL DEFAULT 0,
  total_capacity INTEGER DEFAULT 0,
  sold_tickets INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT 0,
  is_promo BOOLEAN DEFAULT 0,
  is_early_bird BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'draft',
  cover_image TEXT,
  interested_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Catégories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT DEFAULT '🎭',
  color TEXT DEFAULT '#f97316',
  is_active BOOLEAN DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

-- Villes
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  country TEXT DEFAULT 'TG'
);

-- Lieux
CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city_id TEXT,
  capacity INTEGER DEFAULT 0
);

-- Types de billets
CREATE TABLE ticket_types (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  total_available INTEGER DEFAULT 0,
  sold_tickets INTEGER DEFAULT 0,
  is_on_sale BOOLEAN DEFAULT 1
);
```

## 🌐 Données Initiales

### Catégories Culturelles
1. **Concert** 🎵 - #f97316
2. **Festival** 🎭 - #22c55e  
3. **Théâtre** 🎪 - #6366f1
4. **Danse** 💃 - #ec4899
5. **Exposition** 🎨 - #8b5cf6
6. **Autre** 📅 - #6b7280

### Villes du Togo
- Lomé, Kara, Sokodé, Atakpamé, Kpalimé

### Lieux par Défaut
- Palais des Congrès (Lomé)
- Stade de Kégué (Lomé)
- Centre Culturel Français (Lomé)
- Kara Events Center (Kara)
- Sokodé Cultural Hall (Sokodé)

## 🔧 Configuration

### Variables d'Environnement
```bash
# Port du serveur
PORT=8000

# Chemin de la base de données
DB_PATH=./togoevents.db

# Environnement
NODE_ENV=development
```

### .env.example
```bash
PORT=8000
DB_PATH=./togoevents.db
NODE_ENV=development
```

## 🛠️ Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "init-db": "node scripts/init-database.js"
}
```

## 🔒 Sécurité

- **Helmet**: Protection contre les vulnérabilités web
- **CORS**: Configuration pour localhost:3000
- **Validation**: Validation des champs requis
- **SQLite**: Base de données sécurisée

## 📝 Logs

Le serveur utilise Morgan pour les logs HTTP:
```bash
GET /api/health 200 10.123 ms
POST /api/events 201 45.678 ms
GET /api/events 200 5.432 ms
```

## 🚀 Déploiement

### Production
```bash
# Installation
npm install --production

# Démarrage
NODE_ENV=production npm start
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 🧪 Tests

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Créer un Événement
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d @test_event.json
```

### Lister les Événements
```bash
curl http://localhost:8000/api/events
```

## 🐛 Débogage

### Mode Développement
```bash
DEBUG=* npm start
```

### Logs Base de Données
Les requêtes SQL sont loggées en mode développement.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - Voir le fichier LICENSE

## 🎯 Support

Pour toute question ou problème:
- 📧 Email: support@togoevents.tg
- 🌐 Web: https://togoevents.tg
- 📱 Téléphone: +228 XX XX XX XX

---

*🎭 TogoEvents – N°1 de la billetterie événementielle culturelle au Togo*
