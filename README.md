# Teamify Socket Server

Serveur Socket.IO pour la messagerie en temps réel de l'application Teamify.

## Repository principale Teamify

Retrouvez le code source de l’application Teamify (frontend & backend) ici :  
[https://github.com/michel-DC/Teamify](https://github.com/michel-DC/Teamify)

## Description

Ce serveur gère les communications en temps réel pour l'application Teamify, incluant la messagerie instantanée, les notifications et la synchronisation des données entre les clients connectés.

## Fonctionnalités

- **Messagerie en temps réel** : Envoi et réception de messages instantanés
- **Gestion des conversations** : Rejoindre/quitter des conversations privées et de groupe
- **Authentification** : Vérification des utilisateurs via cookies de session
- **Persistance** : Sauvegarde automatique des messages en base de données
- **Health check** : Endpoint de monitoring à `/health`

## Technologies

- **Node.js** (>=18.0.0)
- **Socket.IO** 4.8.1
- **Prisma** 6.16.2
- **PostgreSQL** (base de données)
- **Vercel** (déploiement)

## Installation

```bash
# Installation des dépendances
pnpm install

# Configuration de la base de données
npx prisma generate
npx prisma db push
```

## Configuration

Variables d'environnement requises :

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://teamify.onlinemichel.dev
SOCKET_PORT=3001
NODE_ENV=production
```

## Démarrage

```bash
# Développement
pnpm dev

# Production
pnpm start
```

Le serveur démarre sur le port 3001 par défaut.

## API Socket.IO

### Événements écoutés

- `ping` : Test de connexion
- `message:send` : Envoi de message
- `join:conversation` : Rejoindre une conversation
- `leave:conversation` : Quitter une conversation

### Événements émis

- `pong` : Réponse au ping
- `message:new` : Nouveau message reçu
- `conversation:joined` : Confirmation de connexion à une conversation
- `welcome` : Message de bienvenue
- `error` : Erreurs diverses

## Déploiement

Le projet est configuré pour être déployé sur Vercel avec le fichier `vercel.json`.

## Architecture

- **Middleware d'authentification** : Vérification des cookies de session
- **Gestion des rooms** : Isolation des conversations par ID
- **Persistance** : Intégration avec l'API REST pour la sauvegarde
- **CORS** : Configuration pour les domaines autorisés
- **Graceful shutdown** : Arrêt propre du serveur
