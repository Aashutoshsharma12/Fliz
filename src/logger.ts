const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
// Create a DailyRotateFile transport with max 20 files
const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '5d', // Keep only the latest 20 files
    maxSize: '20m',  // Optional: Maximum file size (e.g., 20MB)
});

// Create a logger instance
const logger = createLogger({
    level: 'info',  // Log level, e.g., 'info', 'error', etc.
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }), // This ensures that error stack traces are available
        format.printf((info: any) => {
            // Extract the timestamp, level, and message
            const { timestamp, level, message, stack } = info;

            // If it's an error, include the stack trace, otherwise just log the message
            if (stack) {
                return `${timestamp} ${level}: ${stack}`;
            } else {
                // If the message is an object, stringify it
                const logMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
                return `${timestamp} ${level}: ${logMessage}`;
            }
        })
        //  `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        dailyRotateFileTransport,
        // new transports.Console()  // Optionally log to the console
    ],
});

// Export the logger
export = logger;
