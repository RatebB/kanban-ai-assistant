# Kanban IA — Trello avec assistant de découpage de tâches

Un board Kanban avec drag & drop, où une IA aide à découper les tâches complexes en sous-tâches actionnables en un clic.

Developpement en cours 
<!--![Démo](./demo.gif)
 Remplace par un GIF de démo : enregistre-toi en train d'utiliser l'app avec un outil comme Kap ou ScreenToGif

**[Voir la démo live →](https://ton-projet.vercel.app)** -->

## Pourquoi ce projet

Les outils de gestion de projet classiques laissent l'utilisateur seul face à la décomposition du travail. Ce projet explore comment une IA peut assister — sans remplacer — le jugement humain sur cette tâche : l'utilisateur reste toujours en contrôle des sous-tâches finalement ajoutées à son board.

## Fonctionnalités

- Board Kanban avec colonnes personnalisables
- Drag & drop fluide entre colonnes, avec persistance en base de données
- Découpage de tâches assisté par IA : à partir d'un titre de carte, génération de 3 à 6 sous-tâches actionnables, sélectionnables individuellement avant ajout
- Validation stricte des réponses IA côté serveur (schéma Zod) pour garantir un format exploitable

## Stack technique

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components pour les données, routes API intégrées, déploiement simple sur Vercel |
| Langage | TypeScript (strict) | Sécurité de typage sur les échanges avec l'IA et la base de données |
| Drag & drop | `@dnd-kit` | Plus léger et mieux maintenu que les alternatives historiques, accessible au clavier |
| Base de données | Supabase (Postgres) | Postgres managé gratuit, API auto-générée, prêt pour l'authentification si besoin plus tard |
| IA | Groq (`openai/gpt-oss-120b`) | Inférence très rapide, API compatible OpenAI, quota gratuit généreux pour un usage démo |
| Validation | Zod | Garde-fou entre la réponse non déterministe de l'IA et le reste de l'application |

## Architecture

```
app/
  page.tsx                    # Page principale, récupère le board depuis Supabase (Server Component)
  api/
    cards/
      move/route.ts           # Persiste le déplacement d'une carte
      create-batch/route.ts   # Crée plusieurs sous-tâches en une fois
    ai/
      breakdown/route.ts      # Appelle Groq, valide et retourne les sous-tâches
components/
  Board.tsx                   # Orchestration du drag & drop et de l'état du board
  Column.tsx                  # Une colonne du Kanban
  Card.tsx                    # Une carte, avec le déclencheur de découpage IA
  BreakdownModal.tsx          # Interface de génération et sélection des sous-tâches
lib/
  supabase.ts                 # Client Supabase
  schemas.ts                  # Schémas Zod pour la validation des réponses IA
types/
  board.ts                    # Types partagés (Board, Column, Card)
```

## Comment fonctionne l'intégration IA

1. L'utilisateur clique sur l'icône de découpage d'une carte
2. Le frontend appelle `/api/ai/breakdown` avec le titre de la carte
3. La route construit un prompt structuré et interroge Groq, en forçant une réponse JSON
4. La réponse est validée avec un schéma Zod (3 à 8 sous-tâches, titres non vides) avant d'être renvoyée au client
5. L'utilisateur sélectionne les sous-tâches pertinentes et les ajoute au board — rien n'est créé automatiquement

Exemple de prompt système utilisé :

```
Tu es un assistant qui découpe des tâches de projet en sous-tâches actionnables.
Règles :
- Génère entre 3 et 6 sous-tâches
- Chaque sous-tâche doit être concrète et réalisable
- Réponds UNIQUEMENT avec un JSON valide au format : {"subtasks": [...]}
```

## Limites connues

- Les positions des cartes ne sont pas recalculées pour l'ensemble d'une colonne lors d'un déplacement (seule la carte déplacée est repositionnée) — amélioration prévue
- Le quota gratuit de Groq (1000 requêtes/jour) n'est pas garanti dans le temps ; un fallback ou une limite côté utilisateur serait nécessaire en production
- Pas d'authentification : le board est actuellement partagé publiquement en démo

## Lancer le projet en local

```bash
git clone https://github.com/RatebB/kanban-ai-assistant.git
cd nom-repo
npm install
```

Crée un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

Puis lance le schéma SQL fourni dans `supabase/schema.sql` sur ton propre projet Supabase, et démarre :

```bash
npm run dev
```

## Ce que ce projet démontre

- Architecture Next.js App Router avec Server Components pour les données et Client Components pour l'interactivité
- Intégration d'un LLM en production avec validation stricte de sortie (pas de confiance aveugle dans la réponse IA)
- UX réfléchie autour de l'incertitude de l'IA : l'utilisateur garde le contrôle final sur ce qui est ajouté
- Persistance temps réel avec mise à jour optimiste de l'interface
