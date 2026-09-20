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
            const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey)
            });
            console.log('[Firebase Admin] Initialized from environment variable');
        } else {
            console.warn('[Firebase Admin] No service account key found in FIREBASE_SERVICE_ACCOUNT env var. Google Auth server verification will be unavailable.');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization error:', error.message);
    }
};

initFirebase();

export default admin;
