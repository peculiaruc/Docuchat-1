import { prisma } from '../lib/prisma';
import {queueDocumentProcessing} from '../queues/document.queue';
import { appEvents } from '../lib/events';

export async function createDocument(data: {
    title: string;
    content: string;
    userId: string;
}) {
    //create the document with pending status
    const doc = await prisma.document.create({
         data: {
            title: data.title,
            content: data.content,
            userId: data.userId,
            status: 'pending',
            filename: data.title.toLowerCase().replace( /\s+/g, '_'),
        },
    });

    //queue for background processing
    const jobId = await queueDocumentProcessing(doc.id, data.userId);

    appEvents.emit('document.created', {
        documentId: doc.id,
        userId: data.userId,
        title: data.title,
    });
    return { document: doc, jobId };
}
