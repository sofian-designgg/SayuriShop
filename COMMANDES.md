# 🎮 Guide des commandes — Sayuri Shop Bot

**Préfixe :** `+`

---

## ═══════════════════════════════════════════
## 📦 SHOP
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+setcolor` | `+setcolor #FF5733` | Définir la couleur des embeds |
| `+setname` | `+setname Mon Shop` | Définir le nom du shop |
| `+setstatus` | `+setstatus Ouvert 24/7` | Définir le statut affiché |
| `+setlogo` | `+setlogo https://...` | URL du logo du shop |
| `+setdescription` | `+setdescription Texte` | Description du shop |

---

## ═══════════════════════════════════════════
## 🛡️ MODÉRATION
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+ban` | `+ban @user [raison]` | Bannir un membre |
| `+kick` | `+kick @user [raison]` | Expulser un membre |
| `+mute` | `+mute @user [min] [raison]` | Timeout (10 min par défaut) |
| `+warn` | `+warn @user [raison]` | Avertir un membre |
| `+warns` | `+warns @user` | Voir les avertissements |
| `+warns` | `+warns @user clear` | Effacer les warns |
| `+clear` | `+clear 20` | Supprimer 1 à 100 messages |
| `+setlogs` | `+setlogs #salon` | Salon des logs modération |

---

## ═══════════════════════════════════════════
## 🎫 TICKETS
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+ticketsetup` | `+ticketsetup id_cat id_panel [id_transcript]` | Configurer tickets |
| `+ticketrole` | `+ticketrole add @rôle` | Ajouter rôle support |
| `+ticketrole` | `+ticketrole remove @rôle` | Retirer rôle support |
| `+ticketpanel` | `+ticketpanel` | Envoyer le panel de création |
| `+ticketmsg` | `+ticketmsg panel <texte>` | Message du panel |
| `+ticketmsg` | `+ticketmsg created <texte>` | Message ticket créé (utilise `{user}`) |
| `+ticketbuttons` | `+ticketbuttons Support\|Vente\|Réclamation` | Boutons du panel (max 5) |
| `+ticketconfig` | `+ticketconfig category \| panel \| transcript \| max <id>` | Config détaillée |
| `+ticketadd` | `+ticketadd @user` | Ajouter qqn au ticket (dans un ticket) |
| `+ticketremove` | `+ticketremove @user` | Retirer qqn du ticket |
| `+ticketrename` | `+ticketrename nom` | Renommer le ticket |

---

## ═══════════════════════════════════════════
## 📝 EMBEDS & ANNONCES
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+embed` | `+embed Titre \| Description \| [url_image]` | Envoyer un embed |
| `+annonce set` | `+annonce set #salon` | Définir salon annonces |
| `+annonce` | `+annonce Titre \| Description \| [url_image]` | Envoyer une annonce |

---

## ═══════════════════════════════════════════
## 📩 DM ALL
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+dmall` | `+dmall Ton message ici` | DM à tous les membres (rate limit 2s) |

---

## ═══════════════════════════════════════════
## 🎉 GIVEAWAYS
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+gsetchannel` | `+gsetchannel #salon` | Salon des giveaways |
| `+gstart` | `+gstart 60 1 Nitro 1 mois` | Lancer un giveaway |
| `+gend` | `+gend [id_message]` | Terminer un giveaway |
| `+greroll` | `+greroll id_message [nb]` | Re-tirer un gagnant |

---

## ═══════════════════════════════════════════
## 📊 SURVEILLANCE STOCK
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+stockchannel` | `+stockchannel #salon` | Salon des alertes rupture |
| `+stockmonitor` | `+stockmonitor on` | Activer surveillance |
| `+stockmonitor` | `+stockmonitor off` | Désactiver surveillance |
| `+stock` | `+stock` | Afficher le stock de tous les items |

---

## ═══════════════════════════════════════════
## ❓ AIDE
## ═══════════════════════════════════════════

| Commande | Usage | Description |
|----------|-------|-------------|
| `+help` | `+help` | Liste toutes les commandes |
| `+help` | `+help ban` | Détail d'une commande |
