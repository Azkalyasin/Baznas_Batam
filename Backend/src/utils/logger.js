import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '..', '..', 'logs');

const isProduction = process.env.NODE_ENV === 'production';

// Format untuk console (colorize di dev, plain di production)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Format untuk file (JSON structured)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test' // Bungkam log saat testing
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 5
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 10
  })
];

const logger = winston.createLogger({
  level: isProduction ? 'warn' : 'debug',
  transports,
  // Jangan crash app jika ada error pada logger itu sendiri
  exitOnError: false
});

// Tambah level 'http' untuk morgan stream
logger.stream = {
  write: (message) => logger.http(message.trim())
};

export default logger;
