import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, '../../react-blog.json');

export const initFirebase = () => {
    try {
        if (admin.apps.length > 0) return admin.app();

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // dotenv does NOT strip surrounding single-quotes — handle both ' and " wrapped values
            let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            if ((raw.startsWith("'") && raw.endsWith("'")) ||
                (raw.startsWith('"') && raw.endsWith('"'))) {
                raw = raw.slice(1, -1);
            }

            const serviceAccountKey = JSON.parse(raw);

            // Ensure the private key has real newlines (env vars may store literal \n)
            if (serviceAccountKey.private_key && !serviceAccountKey.private_key.includes('\n')) {
                serviceAccountKey.private_key = serviceAccountKey.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey)
            });
            console.log('[Firebase Admin] Initialized from environment variable');
        } else {
            console.warn('[Firebase Admin] No service account key found in FIREBASE_SERVICE_ACCOUNT env var. Google Auth server verification will be unavailable.');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization error:', error.message);
        console.error('[Firebase Admin] Tip: Ensure FIREBASE_SERVICE_ACCOUNT is valid JSON (no surrounding single-quotes, proper escaping).');
    }
};

initFirebase();

export default admin;
