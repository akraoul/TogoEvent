/**
 * Logger - Système de logging
 * TogoEvents Backend
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.errorFile = path.join(this.logDir, 'error.log');
    this.accessFile = path.join(this.logDir, 'access.log');
    
    this.ensureLogDir();
  }

  /**
   * Crée le répertoire de logs s'il n'existe pas
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Formate un message de log
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  }

  /**
   * Écrit un message dans un fichier de log
   */
  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message + '\n');
    } catch (error) {
      console.error('Erreur lors de l\'écriture dans le fichier de log:', error);
    }
  }

  /**
   * Log de niveau INFO
   */
  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('INFO', message, meta);
    console.info(formattedMessage);
    this.writeToFile(this.logFile, formattedMessage);
  }

  /**
   * Log de niveau WARN
   */
  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('WARN', message, meta);
    console.warn(formattedMessage);
    this.writeToFile(this.logFile, formattedMessage);
  }

  /**
   * Log de niveau ERROR
   */
  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('ERROR', message, meta);
    console.error(formattedMessage);
    this.writeToFile(this.errorFile, formattedMessage);
    this.writeToFile(this.logFile, formattedMessage);
  }

  /**
   * Log de niveau DEBUG
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(formattedMessage);
      this.writeToFile(this.logFile, formattedMessage);
    }
  }

  /**
   * Log d'accès (requêtes HTTP)
   */
  access(req, res, duration) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    const meta = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length') || 0
    };
    
    const formattedMessage = this.formatMessage('ACCESS', message, meta);
    this.writeToFile(this.accessFile, formattedMessage);
  }

  /**
   * Log d'erreur avec stack trace
   */
  errorWithStack(message, error, meta = {}) {
    const errorMeta = {
      ...meta,
      error: error.message,
      stack: error.stack
    };
    
    this.error(message, errorMeta);
  }

  /**
   * Log de performance
   */
  performance(operation, duration, meta = {}) {
    const message = `${operation} completed in ${duration}ms`;
    const performanceMeta = {
      ...meta,
      operation,
      duration: parseInt(duration)
    };
    
    this.info(message, performanceMeta);
  }

  /**
   * Log de base de données
   */
  database(query, duration, meta = {}) {
    const message = `DB Query: ${query.split(' ')[0]} - ${duration}ms`;
    const dbMeta = {
      ...meta,
      queryType: query.split(' ')[0],
      duration: parseInt(duration)
    };
    
    this.debug(message, dbMeta);
  }

  /**
   * Log d'authentification
   */
  auth(action, userId, success, meta = {}) {
    const message = `Auth ${action} - ${success ? 'SUCCESS' : 'FAILED'} - User: ${userId}`;
    const authMeta = {
      ...meta,
      action,
      userId,
      success,
      timestamp: new Date().toISOString()
    };
    
    if (success) {
      this.info(message, authMeta);
    } else {
      this.warn(message, authMeta);
    }
  }

  /**
   * Log d'API
   */
  api(endpoint, method, statusCode, duration, meta = {}) {
    const message = `API ${method} ${endpoint} - ${statusCode} - ${duration}ms`;
    const apiMeta = {
      ...meta,
      endpoint,
      method,
      statusCode,
      duration: parseInt(duration)
    };
    
    if (statusCode >= 400) {
      this.warn(message, apiMeta);
    } else {
      this.info(message, apiMeta);
    }
  }

  /**
   * Nettoie les anciens fichiers de log
   */
  cleanup() {
    try {
      const files = [this.logFile, this.errorFile, this.accessFile];
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
      const now = Date.now();

      files.forEach(file => {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(file);
            this.info(`Ancien fichier de log supprimé: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Erreur lors du nettoyage des logs', { error: error.message });
    }
  }

  /**
   * Middleware Express pour le logging des requêtes
   */
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log de la requête entrante
      this.info(`Requête entrante: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Intercepter la fin de la réponse
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.access(req, res, duration);
      });

      next();
    };
  }
}

// Singleton pour le logger
const logger = new Logger();

// Nettoyer les anciens logs tous les jours
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    logger.cleanup();
  }, 24 * 60 * 60 * 1000); // 24 heures
}

module.exports = logger;
