const pino = require('pino');

let logger;

exports.getLogger = () => {
    if (!logger) {
        logger = pino({
            level: process.env.LOG_LEVEL || 'info'
        });
    }
    return logger;
};