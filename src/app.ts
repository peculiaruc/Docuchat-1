import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import './events/auth.events.js';
import { authRoutes } from './routes/auth.js';

const app = express();

//MIDDLEWARE
app.use(cors());                    // Security header
app.use(helmet());                  //Cross-origin requestq
app.use(express.json());            // Parse JSON request bodies

//===REQUEST LOGGING===
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// ===HEALTH CHECK ===
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
    })
});

// ===ROUTES===
app.use('/api/auth', authRoutes);
//app.use('/api/v1/documents', DocumentRouter);
//app.use('/api/v1/chat', chatRouter);

// ===ERROR HANDLER=== (must be last middleware)
app.use(errorHandler);

export default app;
