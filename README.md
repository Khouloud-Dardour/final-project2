# 🚌 BusDZ - Plateforme de Réservation de Billets d'Autobus

Une application web moderne et entièrement fonctionnelle de réservation de billets d'autobus construite avec **HTML, CSS et JavaScript** en utilisant LocalStorage comme base de données. Aucun backend requis!

## 🎨 Caractéristiques du Design

- **Thème sombre moderne** avec des gradients vibrants (accents rouge, cyan, jaune)
- Effets **Glassmorphisme** avec flou de fond
- **Animations fluides** et effets au survol
- **Design responsive** - Fonctionne parfaitement sur mobile, tablette et bureau
- **Interface professionnelle** inspirée par ClickBus et RedBus
- **Thème clair et sombre** - Basculez entre les deux modes

## ✨ Caractéristiques Principales

### 1. 🏠 Page d'Accueil
- Section héros animée avec effets de fond flottants
- Formulaire de recherche avec menus déroulants de villes, sélecteur de date et nombre de passagers
- 6 cartes de fonctionnalités présentant les avantages de la plateforme
- Navigation moderne avec lien admin

### 2. 🔍 Page de Résultats de Recherche
- Listes de trajets dynamiques à partir de la base de données d'exemple
- **Filtrer par compagnie** avec menu déroulant
- **Options de tri**: Recommandé, Prix (Bas→Haut, Haut→Bas), Heure de Départ
- Belles cartes de trajets avec:
  - Nom de la compagnie d'autobus avec icône
  - Villes de départ et d'arrivée
  - Durée du voyage
  - Prix par personne
  - Nombre de sièges disponibles
  - Bouton "Réserver Maintenant" avec effets au survol

### 3. 🪑 Page de Sélection de Sièges
- **Disposition d'autobus visuelle** (4 sièges par rangée, 40 sièges au total)
- **Sièges interactifs** avec 3 états:
  - Disponible (cliquable avec effet au survol)
  - Sélectionné (surligné avec dégradé)
  - Occupé (désactivé, grisé)
- Légende montrant l'état des sièges
- Validation de sélection de sièges (doit correspondre au nombre de passagers)
- Bouton Continuer pour procéder

### 4. 👤 Page Informations Passager
- Formulaire pour collecter les informations du passager:
  - Nom Complet
  - Numéro de Téléphone
  - Email (optionnel)
- **Barre latérale récapitulatif collante** affichant:
  - Détails du trajet
  - Sièges sélectionnés
  - Détail du prix
- Bouton Confirmer la Réservation

### 5. 🎫 Page Confirmation de Billet
- Design de carte de billet premium
- **Génération de code QR** (utilisant une bibliothèque CDN)
- Détails complets de la réservation:
  - ID de réservation
  - Nom et téléphone du passager
  - Informations d'itinéraire
  - Date et heure de départ
  - Sièges sélectionnés
  - Prix total
- **Bouton Imprimer / Télécharger** le billet (utilise la boîte de dialogue d'impression)
- Lien Retour à l'Accueil

### 6. 👨‍💼 Tableau de Bord Admin
- **Système de connexion simulé** avec identifiants par défaut:
  - Nom d'utilisateur: `admin`
  - Mot de passe: `admin123`
- L'administrateur peut:
  - ✅ Afficher tous les trajets dans un panneau de gestion
  - ✅ Ajouter de nouveaux trajets avec formulaire dynamique
  - ✅ Modifier les compagnies de trajets
  - ✅ Supprimer les trajets
  - ✅ Afficher toutes les réservations effectuées
- Fonctionnalité de déconnexion

## 🗄️ Base de Données LocalStorage

Toutes les données sont stockées dans LocalStorage du navigateur:

```javascript
localStorage.trips      // Tableau des trajets d'autobus
localStorage.bookings   // Tableau des réservations confirmées
localStorage.users      // Comptes utilisateurs administrateur
localStorage.lastSearch // Derniers paramètres de recherche
localStorage.selectedTrip // Trajet actuellement sélectionné
localStorage.seatSelection // Sièges sélectionnés
localStorage.currentBooking // Réservation en cours
localStorage.lastBooking // ID de dernière réservation
```

## 📁 Structure des Fichiers

```
final-project2/
├── index.html           # Page d'accueil
├── results.html         # Résultats de recherche
├── seats.html           # Sélection de sièges
├── passenger.html       # Informations passager
├── ticket.html          # Confirmation de billet
├── admin.html           # Tableau de bord admin
├── css/
│   └── style.css        # Tous les styles (600+ lignes)
├── js/
│   └── app.js           # Logique principale de l'application
└── README.md            # Ce fichier
```

## 🚀 Comment Exécuter

### Option 1: Ouverture Directe de Fichier (La plus facile)
1. Ouvrir le dossier `final-project2`
2. Double-cliquer sur `index.html` pour ouvrir dans le navigateur par défaut
3. Commencer à réserver!

### Option 2: Utiliser Live Server (Recommandé pour le Développement)
```bash
# Si vous avez l'extension Live Server dans VS Code:
1. Cliquer droit sur index.html
2. Sélectionner "Open with Live Server"
3. Le navigateur s'ouvrira automatiquement à http://localhost:5500
```

### Option 3: Utiliser Python (si installé)
```bash
# Naviguer vers le dossier du projet
cd final-project2

# Python 3.x
python -m http.server 8000

# Puis ouvrir: http://localhost:8000
```

### Option 4: Utiliser Node.js (si installé)
```bash
# Installer http-server globalement
npm install -g http-server

# Démarrer le serveur
http-server

# Ouvrir l'URL affichée dans le navigateur
```

## 🎮 Comment Utiliser

### Réserver un Billet:
1. **Page d'Accueil**: Sélectionner villes de départ/arrivée, date, nombre de passagers
2. **Résultats de Recherche**: Afficher les trajets disponibles, filtrer et trier selon les besoins
3. **Sélection de Sièges**: Choisir vos sièges préférés (doit correspondre au nombre de passagers)
4. **Informations Passager**: Entrer votre nom et numéro de téléphone
5. **Confirmation**: Afficher votre billet avec code QR et imprimer/télécharger

### Panneau Admin:
1. Cliquer sur "Admin" dans la navigation
2. Se connecter avec `admin` / `admin123`
3. Gérer les trajets (ajouter, modifier, supprimer)
4. Afficher toutes les réservations
5. Cliquer sur "Déconnexion" pour quitter

## 🎨 Points Forts du Design

- **Palette de Couleurs**:
  - Rouge Primaire: `#ff6b6b`
  - Cyan Secondaire: `#4ecdc4`
  - Jaune Accent: `#ffe66d`
  - Fond Sombre: `#1a1a2e`
  - Fond Clair: `#f5f5f5`

- **Animations**:
  - Animations de fade-in au chargement de la page
  - Effets au survol sur tous les éléments interactifs
  - Transitions fluides (0.3s cubic-bezier)
  - Éléments de fond flottants
  - Effets de pulsation sur les boutons

- **Typographie**:
  - Police: Poppins (Google Fonts)
  - Tailles réactives
  - Hiérarchie visuelle claire

## 🌓 Thème Clair et Sombre

- **Basculer le thème**: Cliquez sur l'icône 🌙/☀️ dans la barre de navigation
- **Préférence enregistrée**: Votre choix est sauvegardé dans LocalStorage
- **Adaptation complète**: Tous les éléments supportent les deux thèmes
- **Contraste optimisé**: Readabilité garantie sur les deux modes

## 📱 Points d'Arrêt Responsive

- **Bureau**: Disposition complète avec sections côte à côte
- **Tablette** (900px): Espacement et grille ajustés
- **Mobile** (600px): Dispositions mono-colonne, cibles de toucher optimisées

## 🔒 Confidentialité des Données

✅ **100% Stockage Local** - Toutes les données stockées dans votre navigateur
✅ **Pas de Backend** - Aucune donnée envoyée à des serveurs
✅ **Pas de Cookies** - Pas de suivi
✅ **Confidentialité Totale** - Vos réservations restent avec vous

## 📝 Données Échantillon

L'application est pré-chargée avec:
- **10 trajets échantillons** à travers les villes algériennes
- **4 compagnies d'autobus**: Sahra Travel, Atlas Bus, Safa Voyages, El-Khayr
- **8 grandes villes**: Alger, Oran, Sétif, Constantine, Blida, M'sila, Béjaïa, Tizi Ouzou

## 🐛 Fonctionnalités de Test

```javascript
// Pour effacer toutes les données et réinitialiser:
localStorage.clear();
// Puis actualiser la page

// Pour afficher les données brutes:
console.log(JSON.parse(localStorage.getItem('trips')));
console.log(JSON.parse(localStorage.getItem('bookings')));
```

## 🎯 Compatibilité Navigateur

✅ Chrome/Edge (Dernière version)
✅ Firefox (Dernière version)
✅ Safari (Dernière version)
✅ Navigateurs mobiles

## 💡 Améliorations Futures

- Intégration de passerelle de paiement réelle
- Notifications par email/SMS
- Annulation de réservation
- Détails de plusieurs passagers
- Billets aller-retour
- Codes de réduction
- Comptes utilisateur

## 📜 Licence

Libre d'utilisation et de modification à des fins pédagogiques.

---

**Construit avec ❤️ en utilisant HTML, CSS et JavaScript**

Profitez de réserver vos billets d'autobus! 🚌✈️
