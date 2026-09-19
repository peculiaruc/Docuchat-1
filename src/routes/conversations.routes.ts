import { Request, Response, NextFunction, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { prisma } from "../lib/prisma";
import {
  createConversationSchema,
  sendMessageSchema,
} from "../validators/conversation.validator";

const router = Router();
router.use(authenticate);

async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
    });
    res.json(conversations);
  } catch (error) {
    next(error);
  }
}

async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user!.id,
        title: req.body.title,
      },
    });
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.status(201).json({
      conversationId: conversation.id,
      content: req.body.content,
    });
  } catch (error) {
    next(error);
  }
}

router.get("/", listConversations);
router.post("/", validate(createConversationSchema), createConversation);
router.post("/:id/messages", validate(sendMessageSchema), sendMessage);

export const conversationRoutes = router;
