# Sayuri Shop Bot

Bot Discord complet pour boutique avec **préfixe `+`** et **MongoDB sur Railway**.

## Installation

1. Clone / télécharge le projet
2. `npm install`
3. Crée un fichier `.env` :
```
DISCORD_TOKEN=ton_token
MONGO_URL=mongodb+srv://...
```
4. Sur Railway : ajoute MongoDB, copie l'URL de connexion dans `MONGO_URL`
5. `npm start`

## Commandes

### Shop
- `+setcolor #HEX` - Couleur du shop
- `+setname <nom>` - Nom du shop
- `+setstatus <statut>` - Statut (ex: Ouvert 24/7)
- `+setlogo <url>` - Logo du shop
- `+setdescription <texte>` - Description

### Modération
- `+ban @user [raison]`
- `+kick @user [raison]`
- `+mute @user [min] [raison]`
- `+warn @user [raison]`
- `+warns @user` / `+warns @user clear`
- `+clear <1-100>`
- `+setlogs #salon` - Salon des logs

### Tickets
- `+ticketsetup <id_catégorie> <id_salon_panel> [id_salon_transcript]`
- `+ticketrole add @role` / `+ticketrole remove @role`
- `+ticketpanel` - Envoie le panel de tickets

### Embed & Annonces
- `+embed <titre> | <description> | [url_image]`
- `+annonce set #salon` - Configurer le salon des annonces
- `+annonce <titre> | <description> | [url_image]` - Envoyer une annonce

### DM All
- `+dmall <message>` - DM à tous les membres (rate limit ~2s entre chaque)

### Surveillance stock
- `+stockchannel #salon` - Salon des alertes rupture de stock
- `+stockmonitor on/off` - Activer/désactiver la surveillance (site surveillé en arrière-plan)

### Giveaways
- `+gsetchannel #salon` - Salon des giveaways
- `+gstart <durée_min> <gagnants> <prize>`
- `+gend [id_message]` - Terminer
- `+greroll <id_message>` - Re-tirer un gagnant

### Config
- `+help` / `+help <commande>`
