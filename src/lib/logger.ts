import pino from 'pino';
import {config} from './config.js';

export const logger = pino({
    level: config.NODE_ENV === 'production' ? 'debug' : 'info',

    transport:
    config.NODE_ENV === 'production'
    ?{
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    }
    : undefined,    
    });
    