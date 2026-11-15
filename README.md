# MohamiConnect

Application juridique full-stack : React + TypeScript côté client, Express + tRPC côté serveur et MySQL/Drizzle pour les données. Le dépôt GitHub privé est le code source du projet; les secrets et les données clients ne sont pas stockés dans Git.

## Ouvrir et modifier le projet dans Visual Studio Code

Prérequis : Git, Node.js 22 et Corepack. Le projet est épinglé sur pnpm 10.18.0.

```bash
git clone https://github.com/soumialahnini95-sketch/mohamiconnect.git
cd mohamiconnect
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
code .
```

Si la commande `code .` n’est pas installée, ouvrez Visual Studio Code et choisissez **Fichier → Ouvrir un dossier…**, puis le dossier `mohamiconnect`.

## Exécution locale complète

Le clone GitHub ne récupère ni les secrets de l’hébergement géré ni sa base de données. Pour faire fonctionner localement l’authentification et les demandes, créez un MySQL de développement séparé et renseignez les valeurs locales nécessaires dans `.env` :

```bash
cp .env.example .env
```

Sous PowerShell : `Copy-Item .env.example .env`. Complétez au minimum `DATABASE_URL`, `MANUS_PROJECT_ID`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL` et `MANUS_JWT_SECRET`. `OWNER_OPEN_ID` permet de reconnaître le compte administrateur du projet; les clés de services listées dans `.env.example` ne sont nécessaires que si ces services sont utilisés. L’URL de retour OAuth locale (`http://localhost:3000/api/oauth/callback`) doit être autorisée par la configuration d’authentification utilisée.

Ne mettez jamais les valeurs réelles dans GitHub. Le fichier `.env` est ignoré par Git; conservez les secrets dans ce fichier local ou dans le gestionnaire de secrets de l’hébergeur. N’exécutez les migrations que sur une base de développement dédiée, jamais sur une base de production ou de données clients.

```bash
pnpm db:migrate   # applique les migrations versionnées à la base indiquée par DATABASE_URL
pnpm dev           # lance le serveur sur http://localhost:3000
```

Sans MySQL et configuration OAuth valides, l’interface peut être modifiée et compilée, mais la connexion et la persistance des demandes ne fonctionneront pas localement.

## Vérifications et production

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

Le `Dockerfile` fournit un point de départ pour un hébergeur compatible avec Node/Docker. Le dépôt GitHub conserve le code, mais GitHub Pages ne peut pas exécuter le serveur Express, l’authentification ni MySQL. L’hébergement complet exige donc un serveur Node/Docker, une base MySQL et les variables d’environnement sécurisées. Le projet MohamiConnect existant continue de fournir son Preview et son runtime géré; publier le code sur GitHub ne publie pas à lui seul un site sur GitHub Pages.

## Maquette statique, administration et LocalStorage

La maquette se trouve dans `docs/index.html`; son administration statique complète est dans `docs/admin.html`. Les styles et scripts locaux sont `docs/styles.css`, `docs/script.js`, `docs/demo-store.js` et `docs/admin.js`. Ouvrez `docs/` avec Visual Studio Code. Pour garantir un même `origin` et un LocalStorage partagé entre les pages, utilisez l’extension Live Server ou lancez un serveur local :

```bash
python -m http.server 5500 --directory docs
```

Ouvrez ensuite `http://localhost:5500/` pour l’aperçu ou `http://localhost:5500/admin.html` pour le tableau administrateur. La clé versionnée `mohamiconnect.demo-state.v1` conserve uniquement les états des profils fictifs (validé/en attente et abonnement démo actif/inactif) dans le navigateur courant. Les changements persistent après actualisation et sont synchronisés entre les pages ouvertes sur la même origine. La page admin comprend un bouton **Réinitialiser la démo**; dans la console du navigateur, l’équivalent est `localStorage.removeItem("mohamiconnect.demo-state.v1"); location.reload();`.

LocalStorage n’est ni un stockage sécurisé ni un contrôle d’accès : n’y mettez jamais de coordonnées client, mot de passe, profil réel ou statut de paiement réel. Tout visiteur peut consulter/modifier ces valeurs; elles ne sont pas partagées entre appareils et aucun montant n’est prélevé. Seule l’application full-stack fournit une authentification, une validation admin et une persistance serveur fiables. GitHub Pages peut publier la maquette statique depuis le dossier `/docs` si cette option est disponible pour le dépôt, mais ne fait pas fonctionner le backend.

## Structure

- `client/` : interface React, pages, composants et styles.
- `server/` : Express, routes tRPC, OAuth et accès MySQL.
- `docs/` : maquette HTML/CSS/JavaScript statique et administration de démonstration.
- `shared/` : constantes et types partagés entre client et serveur.
- `drizzle/` : schéma et migrations de base de données.
- `Dockerfile` : build et démarrage du serveur de production.
