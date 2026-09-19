import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Public route - no auth needed
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Protected route - requires valid access token
router.get('/', authenticate, async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { userId: req.user!.id },
  });
  res.json(docs);
});

export const documentRoutes = router;