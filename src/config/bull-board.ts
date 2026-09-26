import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { documentQueue } from "../queues/document.queue";
import { deadLetterQueue } from "../queues/dead-letter.queue";
import { embeddingQueue } from "../queues/embedding.queue";


const serveAdapter = new ExpressAdapter();
serveAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [
        new BullMQAdapter(documentQueue),
        new BullMQAdapter(embeddingQueue),
        new BullMQAdapter(deadLetterQueue)
    ],
    serverAdapter: serveAdapter,
});

export {serveAdapter as bullBoardAdapter};

