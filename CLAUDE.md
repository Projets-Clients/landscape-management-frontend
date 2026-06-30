# Frontend

Application de suivi de chantier pour entreprise de paysagisme.

Technologies :

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

Contraintes :

- Mobile first
- PWA
- Responsive
- Interface simple pour utilisation terrain

Référence :
Lire tous les documents du dossier ../01-docs avant toute génération.
Lire ../CLAUDE.md pour les règles communes au projet (i18n, documentation).

## i18n

- Ne jamais hardcoder du texte français dans un composant.
- Toujours utiliser `useTranslation()` + `t('section.clé')`.
- Toute nouvelle clé doit être ajoutée dans les 5 fichiers : `src/i18n/locales/fr.json`, `en.json`, `es.json`, `it.json`, `de.json`.
- Pour les dates localisées, utiliser `i18n.language` (récupéré via `useTranslation`) plutôt que `"fr-FR"` hardcodé.
- Les objets de labels statiques (ex : `ROLE_LABELS`, `TRANSITION_LABELS`) doivent être définis **à l'intérieur** du composant pour accéder à `t()`.
