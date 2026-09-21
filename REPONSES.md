# Réponses aux questions - Partie 1

# 1. Commande httpie pour POST
http POST http://localhost:8080/api-v1/ url="https://perdu.com"

# 2. Différences dev/prod
- dev : utilise 'nodemon' (redémarrage auto), logging 'dev'
- prod : utilise 'node' directement, logging 'combined'

# 3. Script npm de formatage
npm run format

# 4. Désactiver X-Powered-By
app.disable('x-powered-by');

# 5. Middleware X-API-version
app.use((req, res, next) => {
    res.setHeader('X-API-version', '1.0.0');
    next();
});

# 6. Middleware favicon
import favicon from 'serve-favicon';
app.use(favicon('static/logo_univ_16.png'));

# 7. Documentation better-sqlite3
https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

# 8. Ouverture/fermeture BDD
- Ouverte au démarrage ('openDatabase()' dans server.mjs)
- Fermée à l'arrêt (SIGINT)

# 9. Cache Express
Les fichiers statiques sont mis en cache (ETag). Ctrl+Shift+R force le rechargement.

# 10. Deux instances
Les deux instances partagent le même fichier 'database/database.sqlite'.