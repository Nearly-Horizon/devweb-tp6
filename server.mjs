import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { PORT, LOG_LEVEL, NODE_ENV } from './config.mjs';
import { openDatabase, closeDatabase } from './database/database.mjs';
import apiV1 from './router/api-v1.mjs';
import apiV2 from './router/api-v2.mjs';

const app = express();

// Configuration Express
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware pour ajouter X-API-version
app.use((req, res, next) => {
    res.setHeader('X-API-version', '2.0.0');
    next();
});

// Autres middlewares
app.use(morgan(LOG_LEVEL));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));

// Swagger
const openapi = YAML.load('./static/open-api.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Routes API v1
app.use('/api-v1', apiV1);

// Routes API v2
app.use('/api-v2', apiV2);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Démarrage
openDatabase();
const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Documentation : http://localhost:${PORT}/api-docs`);
});

// Arrêt propre
process.on('SIGINT', () => {
    server.close(() => {
        closeDatabase();
        process.exit(0);
    });
});