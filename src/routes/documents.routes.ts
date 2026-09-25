import { Request, Response, NextFunction, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from '../middleware/authorize';
import { validate } from "../middleware/validate";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { getUserPermissions } from "../services/rbac.service";
import {documentQueue} from '../queues/document.queue';
import {
  createDocumentSchema,
  documentParamsSchema,
  listDocumentSchema,
} from "../validators/document.validator";

const router = Router();
router.use(authenticate);

async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req.validatedQuery ?? {}) as {
      page?: number;
      limit?: number;
      status?: string;
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const docs = await prisma.document.findMany({
      where: {
        userId: req.user!.id,
        ...(query.status ? { status: query.status } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json(docs);
  } catch (error) {
    next(error);
  }
}

async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await prisma.document.create({
      data: {
        userId: req.user!.id,
        status: "pending",
      },
    });
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!doc) {
      throw new NotFoundError("Document not found");
    }

    if (doc.userId !== req.user!.id) {
      const permissions = await getUserPermissions(req.user!.id);
      if (!permissions.has("users:manage")) {
        throw new NotFoundError("Document not found");
      }
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    await prisma.document.deleteMany({
      where: { id, userId: req.user!.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

router.get("/", validate(listDocumentSchema), listDocuments);
router.post("/", validate(createDocumentSchema), createDocument);
router.get("/:id", validate(documentParamsSchema), getDocument);
router.delete("/:id", validate(documentParamsSchema), deleteDocument);

export const documentRoutes = router;


// Anyone with documents:read can list documents
router.get('/',
  requirePermission('documents:read'),
  validate(listDocumentSchema),
  listDocuments
);

// Only documents:create can upload
router.post('/',
  requirePermission('documents:create'),
  validate(createDocumentSchema),
  createDocument
);

// Only documents:delete can delete (admin only)
router.delete('/:id',
  requirePermission('admin:documents:delete', 'documents:delete'),
  validate(documentParamsSchema),
  deleteDocument
);

router.get(
  "/:id/processing-status",
  requirePermission("documents:read"),
  async (req, res, next) => {
    try {
      const doc = await prisma.document.findUnique({
        where: { id: String(req.params.id) },
        select: { id: true, status: true, error: true, userId: true },
      });
      if (!doc || doc.userId !== req.user!.id) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Document not found" },
        });
      }

      const jobs = await documentQueue.getJobs(["active", "waiting"]);
      const activeJob = jobs.find((j) => j.data.documentId === req.params.id);

      res.json({
        success: true,
        data: {
          status: doc.status,
          error: doc.error,
          jobId: activeJob?.id,
          progress: activeJob?.progress ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
