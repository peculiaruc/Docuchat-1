import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate as auth } from './middleware/auth.middleware.js';
import './events/auth.events.js';
import { authRoutes } from './routes/auth.routes.js';
import { documentRoutes } from './routes/documents.routes.js';
import { conversationRoutes } from './routes/conversations.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import './events/auth.events';
import './events/admin.events';
import adminRoutes from './routes/admin';
import './events/document.events.js';
import './queues/document.worker.js';
import './queues/embedding.worker.js';
import { bullBoardAdapter } from './config/bull-board.js';
import { verifyWebhookSignature } from './middleware/verifyWebhook.js';


const app = express();

//MIDDLEWARE
app.use(cors());                    // Security header
app.use(
 helmet({
    contentSecurityPolicy: false,
  })
);
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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', auth,  documentRoutes);
app.use('/api/v1/conversations', auth, conversationRoutes);
app.use('/api/v1/admin', adminRoutes);

// ===BULLBOARD===
app.use('/admin/queues', bullBoardAdapter.getRouter());

// Capture raw body for webhook routes BEFORE express.json()

app.use(
  "/webhooks",
  express.raw({
    type: "application/json",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
  verifyWebhookSignature(config.WEBHOOK_SECRET, "x-signature")
);

// Then parse JSON for everything else
app.use(express.json());


//API V2 (is not needed now)
// app.use('/api/v2/auth', authRoutesV2);
// app.use('/api/v2/documents', documentRoutesV2);
// app.use('/api/v2/conversations', conversationRoutesV2);

// ===SWAGGER===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {  code: 'NOT_FOUND', message: 'Route ${req.path} not found'},
  });
});

// ===ERROR HANDLER=== (must be last middleware)
app.use(errorHandler);

export default app;
