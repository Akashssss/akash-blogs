import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import connectDB from './src/config/db.js';
import './src/config/firebase.js'; // Safe Firebase Admin init
import routes from './src/routes/index.js';
import errorHandler from './src/middlewares/error.middleware.js';
import { apiLimiter } from './src/middlewares/rateLimiter.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Production Performance & Security Middlewares
app.use(compression());

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Sanitize MongoDB inputs against NoSQL injection
app.use(mongoSanitize());

// 2. Static directory for local media fallback with caching headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    immutable: true
}));

// 3. Database Connection
connectDB();

// 4. Mount Application Routes with Rate Limiting
app.use(apiLimiter);
app.use(routes);

// 5. Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        storageDriver: process.env.STORAGE_DRIVER || 'google_drive'
    });
});

// 6. Centralized Error Handling Middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [Server] Enterprise Blog Engine v2 running on port ${port}`);
    console.log(`📦 [Storage Driver] ${process.env.STORAGE_DRIVER || 'google_drive'} (Active)`);
    console.log(`🛡️  [Security] Helmet, CORS, RateLimiter, MongoSanitize Active`);
    console.log(`⚡ [Performance] Gzip Compression Active`);
    console.log(`======================================================\n`);
});

export default app;
