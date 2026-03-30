# TogoEvents – N°1 de la billetterie événementielle culturelle au Togo

Application web de billetterie événementielle culturelle au Togo, inspirée de Tikerama.com et adaptée au contexte togolais.

## 🎯 Objectif

Permettre aux organisateurs de publier des événements culturels (concerts, festivals, pièces de théâtre, expositions d'art) et aux utilisateurs d'acheter des billets en ligne avec une interface ultra-simple et efficace.

## 🌟 Caractéristiques principales

- **Design afro-minimaliste** inspiré de Tikerama
- **Mobile-first** optimisé pour connexions 3G/4G
- **Paiements mobile money** : T-Money, Flooz, Wave, Orange Money, MTN MoMo
- **Interface intuitive** : achat de billet en moins de 2 minutes
- **QR Codes** sécurisés pour les billets
- **Points de vente physique** intégrés

## 🏗️ Architecture

### Pages principales
1. **Accueil** : Liste des événements (style Tikerama)
2. **Détail événement** : Informations complètes et achat
3. **Paiement** : Checkout ultra-simple
4. **Compte utilisateur** : Billets et abonnements
5. **Dashboard organisateur** : Gestion des événements

### Stack technique
- **Frontend** : React.js + Tailwind CSS
- **Backend** : Python Django + API REST
- **Base de données** : PostgreSQL + Redis
- **Paiements** : InTouch/Fedapay/CinetPay

## 🚀 Démarrage rapide

```bash
# Cloner le projet
git clone <repository-url>
cd TogoEvents

# Installer les dépendances frontend
cd frontend
npm install
npm start

# Installer les dépendances backend
cd ../backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 📱 Accès

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin

## 🎨 Design

- **Couleurs** : Chaudes togolaises (orange, rouge, vert)
- **Typographie** : Inter/Poppins sans-serif
- **Images** : WebP compressées, lazy loading
- **Responsive** : 100% mobile-first

## 💳 Paiements acceptés

- 🟠 **T-Money** (prioritaire)
- 🔵 **Flooz**
- 🟡 **Wave**
- 🟠 **Orange Money**
- 🟢 **MTN MoMo**
- 💳 **Cartes bancaires** (Visa/Mastercard)

## 📍 Localisation

Principales villes desservies :
- Lomé
- Kara  
- Sokodé
- Kpalimé
- Atakpamé
- Dapaong

---

*TogoEvents – La billetterie culturelle accessible à tous*
