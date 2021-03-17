const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

const accessLogFormat = winston.format.printf(({ level, message, timestamp, meta:{ res, req } }) => {
  return `[${new Date(timestamp).toLocaleString()}] [${level}]: ${message} ${res.statusCode} -- ${JSON.stringify(req.headers)}`;
});
const consoleLogFormat = winston.format.printf(({ level, message, timestamp, meta:{ res } }) => {
  return `[${new Date(timestamp).toLocaleString()}] [${level}]: ${message} ${res.statusCode}`;
});

const accessLog = new(winston.transports.DailyRotateFile)({
  filename: './logs/[%DATE%] access.log',
  auditFile: './logs/access-audit.json',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    accessLogFormat
  )
});

const httpLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        consoleLogFormat
      )
    }),
    accessLog
  ]
})

module.exports = httpLogger;
