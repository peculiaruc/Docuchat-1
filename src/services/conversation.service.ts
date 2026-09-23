import { prisma } from "../lib/prisma";

export async function listConversations(
    userId: string,
    options: { page: number; limit: number }
) {
  const { page, limit } = options;
 
  const [conversations, total] = await Promise.all([

    prisma.conversation.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
      skip: (page - 1) * limit,
      take: limit,
      include: {
        messages: {
            orderBy: {createdAt: 'desc'},
            take: 1,            //Only the latest message
          select: {
            content: true,
            createdAt: true,
            role: true,
          },
        },
        
        _count: {
            select: {messages: true,},
        },
      },
    }),
    prisma.conversation.count({ where: {userId}, }),
  ]);

  return {
    data: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt,
        messageCount: conv._count.messages,
        lastMessage: conv.messages[0] || null,
    })),
    meta: {
    total,
    page,
    limit,
  },
  };

}

export async function sendMessage(data: {
    userId: string;
    conversationId: string;
    content: string;
    documentId: string;
}) {
    return prisma.$transaction(async (tx) => {
        const doc = await tx.document.findUnique({
            where: { id: data.documentId },
        });
        if (!doc) {
            throw new Error("Document not found");
        }

        const conversation = await tx.conversation.findFirst({
            where: { id: data.conversationId, userId: data.userId },
        });
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const userMessage = await tx.message.create({
            data: {
                conversationId: data.conversationId,
                role: "user",
                content: data.content,
            },
        });

        await tx.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
        });

        const assistantMessage = await tx.message.create({
            data: {
                conversationId: data.conversationId,
                role: "assistant",
                content: "Thinking...",
            },
        });

        await tx.usageLog.create({
            data: {
                userId: data.userId,
                action: "chat",
                tokens: 0,
                costUsd: 0,
            },
        });

        return { userMessage, assistantMessage };
    });
}
