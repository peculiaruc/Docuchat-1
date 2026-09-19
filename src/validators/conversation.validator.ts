import { z } from "zod";


export const createConversationSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        documentId: z.uuid("Invalid document ID"),
    }),
});

export const sendMessageSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid conversation ID"),
    }),
    body: z.object({
        content: z
            .string()
            .min(1, "Message cannot be empty")
            .max(10000, "Message is too long"),
        documentId: z.uuid().optional(),
    }),
});