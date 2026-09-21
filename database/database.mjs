import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DB_FILE, DB_SCHEMA } from '../config.mjs';

let db;

export function openDatabase() {
    if (db) return db;

    // Créer le dossier database s'il n'existe pas
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const isNew = !fs.existsSync(DB_FILE);

    db = new Database(DB_FILE);

    // Créer la table si nécessaire
    if (isNew) {
        const schema = fs.readFileSync(DB_SCHEMA, 'utf8');
        db.exec(schema);
    }
    return db;
}

export function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

export function getDatabase() {
    if (!db) openDatabase();
    return db;
}