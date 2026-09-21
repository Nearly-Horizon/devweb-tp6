import express from 'express';
import { customAlphabet } from 'nanoid';
import { LINK_LEN } from '../config.mjs';
import { getDatabase } from '../database/database.mjs';

const router = express.Router();
const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    LINK_LEN
);

// GET /
router.get('/', (req, res) => {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) AS count FROM links').get();

    res.format({
        'application/json': () => res.json({ count: row.count }),
        'text/html': () => res.render('root', { count: row.count }),
        default: () => res.status(406).json({ error: 'Not Acceptable' })
    });
});

// POST /
router.post('/', (req, res) => {
    const { url } = req.body;

    res.format({
        'application/json': () => {
            if (!url || typeof url !== 'string') {
                return res.status(400).json({ error: 'URL manquante' });
            }
            try { new URL(url); }
            catch { return res.status(400).json({ error: 'URL invalide' }); }

            const db = getDatabase();
            let shortUrl;
            let attempts = 0;
            do {
                shortUrl = nanoid();
                if (++attempts > 10) return res.status(500).json({ error: 'Erreur' });
            } while (db.prepare('SELECT 1 FROM links WHERE url = ?').get(shortUrl));

            db.prepare('INSERT INTO links (url, origin) VALUES (?, ?)').run(shortUrl, url);
            res.status(201).json({
                url: shortUrl,
                origin: url,
                created_at: new Date().toISOString()
            });
        },
        'text/html': () => {
            const db = getDatabase();
            const count = db.prepare('SELECT COUNT(*) AS count FROM links').get().count;

            if (!url || typeof url !== 'string') {
                return res.status(400).render('root', { count, error: 'URL manquante' });
            }
            try { new URL(url); }
            catch { return res.status(400).render('root', { count, error: 'URL invalide' }); }

            let shortUrl;
            let attempts = 0;
            do {
                shortUrl = nanoid();
                if (++attempts > 10) return res.status(500).render('root', { count, error: 'Erreur' });
            } while (db.prepare('SELECT 1 FROM links WHERE url = ?').get(shortUrl));

            db.prepare('INSERT INTO links (url, origin) VALUES (?, ?)').run(shortUrl, url);
            res.status(201).render('root', {
                count: count + 1,
                shortUrl,
                baseUrl: `${req.protocol}://${req.get('host')}`
            });
        },
        default: () => res.status(406).json({ error: 'Not Acceptable' })
    });
});

// GET /:url
router.get('/:url', (req, res) => {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM links WHERE url = ?').get(req.params.url);
    if (!row) {
        return res.status(404).json({ error: 'Lien introuvable' });
    }

    res.format({
        'application/json': () => res.json({
            url: row.url,
            origin: row.origin,
            created_at: row.created_at,
            visits: row.visits
        }),
        'text/html': () => {
            db.prepare('UPDATE links SET visits = visits + 1 WHERE url = ?').run(req.params.url);
            res.redirect(row.origin);
        },
        default: () => res.status(406).json({ error: 'Not Acceptable' })
    });
});

export default router;