import express from 'express';
import { customAlphabet } from 'nanoid';
import { LINK_LEN } from '../config.mjs';
import { getDatabase } from '../database/database.mjs';

const router = express.Router();
const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    LINK_LEN
);

// GET / : nombre de liens
router.get('/', (req, res) => {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) AS count FROM links').get();
    res.json({ count: row.count });
});

// POST / : créer un lien
router.post('/', (req, res) => {
    const { url } = req.body;

    // Validation
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL manquante ou invalide' });
    }
    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: 'URL syntaxiquement invalide' });
    }

    const db = getDatabase();

    // Générer un identifiant unique
    let shortUrl;
    let attempts = 0;
    do {
        shortUrl = nanoid();
        attempts++;
        if (attempts > 10) {
            return res.status(500).json({ error: 'Impossible de générer un identifiant unique' });
        }
    } while (db.prepare('SELECT 1 FROM links WHERE url = ?').get(shortUrl));

    db.prepare('INSERT INTO links (url, origin) VALUES (?, ?)').run(shortUrl, url);

    res.status(201).json({
        url: shortUrl,
        origin: url,
        created_at: new Date().toISOString()
    });
});

// GET /error : pour tester
router.get('/error', (req, res) => {
    throw new Error('Erreur volontaire pour les tests');
});

// GET /status/:url
router.get('/status/:url', (req, res) => {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM links WHERE url = ?').get(req.params.url);
    if (!row) {
        return res.status(404).json({ error: 'Lien introuvable' });
    }
    res.json({
        url: row.url,
        origin: row.origin,
        created_at: row.created_at,
        visits: row.visits
    });
});

// GET /:url — redirection
router.get('/:url', (req, res) => {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM links WHERE url = ?').get(req.params.url);
    if (!row) {
        return res.status(404).json({ error: 'Lien introuvable' });
    }
    db.prepare('UPDATE links SET visits = visits + 1 WHERE url = ?').run(req.params.url);
    res.redirect(row.origin);
});

export default router;