const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

const accessLogFormat = winston.format.printf(({ level, message, timestamp, meta:{ res, req, httpRequest }}) => {
  return `[${new Date(timestamp).toLocaleString("ru-RU")}] [${level}]: [${httpRequest.remoteIp}] ${message} ${res.statusCode} -- ${JSON.stringify(req.headers)}`;
});
const consoleLogFormat = winston.format.printf(({ level, message, timestamp, meta:{ res, httpRequest } }) => {
  return `[${new Date(timestamp).toLocaleString("ru-RU")}] [${level}]: [${httpRequest.remoteIp}] ${message} ${res.statusCode}`;
});

const accessLog = new winston.transports.DailyRotateFile({
  filename: './logs/%DATE%__access.log',
  auditFile: './logs/access_audit.json',
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
  ],
  meta: true,
  dynamicMeta: (req, res) => {
    const httpRequest = {}
    const meta = {}
    if (req) {
      meta.httpRequest = httpRequest
      httpRequest.requestMethod = req.method
      httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
      httpRequest.protocol = `HTTP/${req.httpVersion}`
      // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
      httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip // just ipv4
      httpRequest.requestSize = req.socket.bytesRead
      httpRequest.userAgent = req.get('User-Agent')
      httpRequest.referrer = req.get('Referrer')
    }

    if (res) {
      meta.httpRequest = httpRequest
      httpRequest.status = res.statusCode
      httpRequest.latency = {
        seconds: Math.floor(res.responseTime / 1000),
        nanos: (res.responseTime % 1000) * 1000000
      }
      if (res.body) {
        if (typeof res.body === 'object') {
          httpRequest.responseSize = JSON.stringify(res.body).length
        } else if (typeof res.body === 'string') {
          httpRequest.responseSize = res.body.length
        }
      }
    }
    return meta
  }
})

module.exports = httpLogger;
