import { env } from 'process';
import app from './app.js';
import {config} from './lib/config.js';
import {logger} from './lib/logger.js';

const PORT = config.PORT;

app.listen(PORT, () => {
    logger.info({
      event: 'server_started',
      port: PORT,
      enviroment: config.NODE_ENV,

    });
});
