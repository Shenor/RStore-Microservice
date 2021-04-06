const winston = require('winston');
require('winston-daily-rotate-file');

const debugLogFormat = winston.format.printf(({ level, message, timestamp}) => {
  return `[${new Date(timestamp).toLocaleString("ru-RU")}] [${level}]: ${message}`;
});

const debugLog = new(winston.transports.DailyRotateFile)({
  filename: './logs/%DATE%__debug.log',
  auditFile: './logs/debug_audit.json',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    debugLogFormat
  )
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    debugLog
  ]
});

module.exports = logger
