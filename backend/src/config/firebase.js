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

        if (fs.existsSync(serviceAccountPath)) {
            const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
            const serviceAccountKey = JSON.parse(rawData);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey)
            });
            console.log('[Firebase Admin] Initialized successfully with service account JSON');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey)
            });
            console.log('[Firebase Admin] Initialized from environment variable');
        } else {
            console.warn('[Firebase Admin] No service account key found. Google Auth server verification will be unavailable.');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization error:', error.message);
    }
};

initFirebase();

export default admin;
