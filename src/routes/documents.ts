import { Request, Response, NextFunction, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { prisma } from "../lib/prisma";
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
    const id = String(req.params.id);
    const doc = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
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
