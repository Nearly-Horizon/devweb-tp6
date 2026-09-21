# Réducteur d'URL — Node.js / Express

Service de réduction d'URL inspiré de [bit.ly](https://bit.ly) ou [tinyurl.com](https://tinyurl.com).
Le projet comprend une API REST (v1 puis v2 avec négociation de contenu), un rendu HTML
côté serveur via EJS, un client AJAX en Single Page Application, et une fonctionnalité
de suppression protégée par clé API.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [API](#api)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [État d'avancement](#état-davancement)
- [Auteur](#auteur)

## Fonctionnalités

- Réduction d'URL avec identifiant court aléatoire (nanoid, longueur configurable)
- Redirection vers l'URL d'origine et comptage des visites
- API REST JSON (v1)
- Négociation de contenu JSON / HTML (v2) via `res.format()`
- Rendu HTML côté serveur avec templates EJS
- Client AJAX (SPA) avec copie de l'URL dans le presse-papier
- Suppression d'un lien protégée par une clé secrète (`X-API-Key`)
- Documentation interactive Swagger UI générée depuis `static/open-api.yaml`

## Stack technique

| Composant        | Technologie                          |
| ---------------- | ------------------------------------ |
| Runtime          | Node.js (ES Modules)                 |
| Framework HTTP   | Express 4                            |
| Base de données  | SQLite via `better-sqlite3`          |
| Templates        | EJS                                  |
| Identifiants     | `nanoid`                             |
| Logs             | `morgan`                             |
| Documentation    | `swagger-ui-express` + `yamljs`      |
| Dev              | `nodemon`, `prettier`, `cross-env`   |

## Installation

```bash
git clone https://github.com/<ton-user>/<ton-repo>.git
cd <ton-repo>
npm install
Configuration
Créer un fichier .env à la racine du projet :

env
PORT=8080
LINK_LEN=6
DB_FILE=database/database.sqlite
DB_SCHEMA=database/database.sql
Le fichier est chargé automatiquement par dotenv via config.mjs.

Lancement
Mode	Commande	Description
Développement	npm run dev	Redémarrage auto (nodemon), logs dev
Production	npm run prod	Exécution directe (node), logs combined
Formatage	npm run format	Prettier sur tous les fichiers .mjs
La base de données database/database.sqlite est créée automatiquement au premier
démarrage à partir du schéma database/database.sql.

Documentation interactive : http://localhost:8080/api-docs

API
API v1 — /api-v1
Méthode	Route	Description	Code
GET	/	Nombre de liens créés	200
POST	/	Créer un lien ({ "url": "..." })	201
GET	/status/:url	Informations sur un lien	200
GET	/:url	Redirection vers l'URL d'origine	302
GET	/error	Génère volontairement une erreur 500 (tests)	500
API v2 — /api-v2
Négociation de contenu via l'en-tête Accept (application/json ou text/html).
Toute autre valeur renvoie 406 Not Acceptable.

Méthode	Route	JSON	HTML
GET	/	{ count }	Page d'accueil + formulaire
POST	/	Lien créé + secret	Page affichant le lien court
GET	/:url	Infos du lien (sans secret)	Incrémente les visites puis redirige
DELETE	/:url	Suppression protégée par X-API-Key	—
Codes de retour de DELETE /:url :

404 — lien inexistant

401 — en-tête X-API-Key absent

403 — clé API invalide

200 — suppression réussie

Client AJAX
Accessible sur http://localhost:8080/client.html. Une SPA qui communique en JSON
avec l'API v2 et propose un bouton « Copier l'URL » (Clipboard API).

Tests
Swagger UI
Toutes les routes sont testables depuis http://localhost:8080/api-docs.
Sélectionner le serveur api-v1 ou api-v2 en haut de l'interface.

# GET nombre de liens (v1)
http http://localhost:8080/api-v1/

# POST création d'un lien (v1)
http POST http://localhost:8080/api-v1/ url="https://perdu.com"

# Redirection (v1)
curl -i http://localhost:8080/api-v1/<id>

# Suppression (v2) avec clé API
http DELETE http://localhost:8080/api-v2/<id> X-API-KEY:<secret>
Déploiement
Le projet est déployable sur Render via le fichier render.yaml

État d'avancement
Partie	Description	Tag	État
1	Prise en main, REPONSES.md reponses
2	Complétion de l'API v1	api-v1
3	Négociation de contenu + HTML (EJS)	api-v2
4	Client AJAX de l'API v2	client-ajax
5	Suppression avec authentification par clé api-v2-delete
Structure du projet
text
.
├── config.mjs                # Variables d'env. + niveau de log
├── server.mjs                # Point d'entrée Express
├── package.json
├── .env                      # (non versionné)
├── database/
│   ├── database.mjs          # Ouverture / fermeture SQLite
│   ├── database.sql          # Schéma
│   └── database.sqlite       # (généré, non versionné)
├── router/
│   ├── api-v1.mjs            # Routes API v1
│   └── api-v2.mjs            # Routes API v2 (contenu négocié)
├── views/
│   └── root.ejs              # Template HTML côté serveur
├── static/
│   ├── client.html           # Client AJAX (SPA)
│   ├── app.js                # Logique du client
│   ├── open-api.yaml         # Spécification OpenAPI
│   └── logo_univ_16.png      # Favicon
├── render.yaml               # Blueprint Render
├── REPONSES.md               # Réponses aux questions (Partie 1)
└── README.md

Dépôt : <https://github.com/Nearly-Horizon/devweb-tp6>

Démo : <https://devweb-tp6.onrender.com>