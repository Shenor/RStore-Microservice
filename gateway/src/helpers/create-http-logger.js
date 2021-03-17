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


// Object formating

// {
//   meta: {
//     req: {
//       url: '/',
//       headers: {
//         authentication: '12345678',
//         origin: 'https://developer.mozilla.org/',
//         accept: '*/*',
//         'cache-control': 'no-cache',
//         'postman-token': '2e51d36e-a31b-4541-a07e-0cee5833f63c',
//         'accept-encoding': 'gzip, deflate, br',
//         connection: 'keep-alive'
//       },
//       method: 'GET',
//       httpVersion: '1.1',
//       originalUrl: '/',
//       query: {}
//     },
//     res: {
//       statusCode: 200
//     },
//     responseTime: 2
//   },
//   level: 'info',
//   message: 'HTTP GET /',
//   timestamp: '2021-03-01T10:54:29.490Z'
// }
