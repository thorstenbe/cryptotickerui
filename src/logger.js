const pino = require('pino');

// exports.logger = pino({
//     level: process.env.LOG_LEVEL || 'info',
//     prettyPrint: {colorize: true}
// });

let logger;

exports.getLogger = () => {
    if (!logger) {
        logger = pino({
            level: process.env.LOG_LEVEL || 'info',
        });
    }
    return logger;
};