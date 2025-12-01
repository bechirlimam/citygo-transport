# CityGo Transport - Projet (Frontend + Backend)

Ce projet contient une **version prête à l'emploi (demo)** du site CityGo Transport.

## Structure
- `/frontend` → App React (Vite). Copiez ce dossier et exécutez `npm install` puis `npm run dev`.
- `/backend` → API Express (endpoints de démonstration). Exécutez `npm install` puis `npm start` dans le dossier backend.
- `Dockerfile`, `docker-compose.yml` → pour containeriser le backend.
- `.env.example` → variables d'environnement.

## Démarrage local (rapide)
1. Frontend :
```bash
cd frontend
npm install
npm run dev
```
2. Backend :
```bash
cd backend
npm install
node server.js
```

## À savoir
- Les endpoints de paiement utilisent actuellement vos liens SumUp & PayPal en mode demo. Pour la production, suivez les docs SumUp & PayPal pour implémenter OAuth et webhooks.
- Le backend génère une facture PDF simple dans `/tmp`.
- Pour SMS, calendar, et stockage persistant, ajoutez vos clés (Twilio, Google) et remplacez le stockage en mémoire par une base (Postgres).

## Déploiement recommandé
- Frontend → Vercel / Netlify
- Backend → Render / Heroku / OVH App
- Base de données → Managed Postgres

Si vous voulez, je peux aussi :
- Préparer le dépôt GitHub et le CI/CD
- Déployer le projet sur Vercel + Render et configurer DNS

Bon travail, Bechir — dites-moi si vous voulez que je crée maintenant le ZIP téléchargeable.
