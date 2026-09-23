import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { appEvents } from "../lib/events";
import { DOC_EVENTS } from "../events/document.events";

interface ListDocumentOptions {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    sortBy?: 'createdAt' | 'title'|'chunksCount';
    sortOrder?: 'asc' | 'desc';
}

export async function listDocuments(userId: string, options: ListDocumentOptions) {
    const {
        page,
        limit,
        status,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = options;
    const where: any = {
        userId,
        deletedAt: null,  //Soft deleted
    };

    if (status) {
        where.status = status;
    }
    if (search) {
        where.title = { contains: search, mode: 'insensitive' };
        where.description = {contains: search, mode: 'insensitive'}
    }


    const [documents, total] = await Promise.all([
        prisma.document.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                fileName: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                chunksCount: true,
            },

        }),
        prisma.document.count({ where }),
    ]);
    return {
        data: documents,
        meta: {
            total,
            page,
            limit,
        },
    };
}

export async function deleteDocument(userId: string, documentId: string) {
    const doc = await prisma.document.findUnique({
        where: { id: documentId },
    });
    
    if (!doc || doc.deletedAt) {
        throw new NotFoundError('Document not found');
    }
    if (doc.userId !== userId) {
        throw new NotFoundError('Document not found');
    }

    const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
            deletedAt: new Date(),
            deletedBy: userId,
        },
    });

    appEvents.emit(DOC_EVENTS.DELETED, {
        userId,
        deletedBy: userId,
        documentId: doc.id,
    });

    return updated;
}

export async function createDocument(
    userId: string,
    extras?: { title?: string; fileSizeBytes?: number }
) {
    const document = await prisma.document.create({
        data: {
            userId,
            status: "pending",
        },
    });

    appEvents.emit(DOC_EVENTS.CREATED, {
        userId,
        id: document.id,
        documentId: document.id,
        title: extras?.title,
        fileSizeBytes: extras?.fileSizeBytes,
    });

    return document;
}
