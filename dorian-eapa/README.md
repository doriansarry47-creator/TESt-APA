# Dorian EAPA

Application clinique APA intelligente, orientee psychiatrie/addictologie/TCA/fragilite, compatible Next.js + API routes + Vercel.

## Fonctions incluses

- Profils EAPA multi-utilisateurs (structure + public principal)
- Evaluation patient T0/T1/T2
- Moteur d'adaptation automatique par type de structure
- Scoring global (0-100) + score psychiatrique complementaire
- Alertes cliniques (rouge/orange/vert)
- Visualisations: radar + progression
- Politique RGPD: identifiant patient anonyme, suppression des identifiants directs cote API
- V2: creation patient, orientation de prescription, MADRS fr, tests adaptes selon pathologie + objectif
- V3: seuils normatifs plus fins (age + sexe), module securite clinique (contre-indications/vigilances), export rapport API

## Stack

- Next.js (App Router)
- TypeScript
- Recharts
- Zod
- Extensible a Supabase/PostgreSQL

## Lancer en local

```bash
npm install
npm run dev
```

## Roadmap recommandee

1. Connecter Supabase/PostgreSQL pour persister profils, bilans et suivis.
2. Ajouter generation PDF server-side (resume clinique, graphiques, recommandations).
3. Ajouter editeur de batteries de tests (ajout/modification protocole/seuils).
4. Ajouter auth EAPA (sans jamais collecter l'identite patient).
5. Integrer tableaux ONAPS exacts (seuils par age/genre/pathologie) depuis vos referentiels internes.

## API V3

- `POST /api/assessment` : calcul clinique complet
- `POST /api/assessment/report` : export textuel du compte rendu clinique (telechargeable)
