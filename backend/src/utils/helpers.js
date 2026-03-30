/**
 * Fonctions utilitaires
 * TogoEvents Backend
 */

const crypto = require('crypto');
const logger = require('./logger');

class Helpers {
  /**
   * Génère un slug unique à partir d'un texte
   */
  static generateSlug(text, existingSlugs = []) {
    let slug = text
      .toLowerCase()
      .normalize('NFD') // Normaliser les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement les lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
      .trim(); // Supprimer les tirets au début et à la fin

    // Si le slug existe déjà, ajouter un suffixe numérique
    let counter = 1;
    let originalSlug = slug;

    while (existingSlugs.includes(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Valide un email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un numéro de téléphone togolais
   */
  static isValidTogoPhone(phone) {
    const phoneRegex = /^(\+228|00228)?[2359]\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Formate un numéro de téléphone togolais
   */
  static formatTogoPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
      return `+228${cleaned}`;
    } else if (cleaned.startsWith('228') && cleaned.length === 10) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('00228') && cleaned.length === 12) {
      return `+${cleaned.substring(2)}`;
    }
    
    return phone;
  }

  /**
   * Génère un token aléatoire
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash un mot de passe
   */
  static async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérifie un mot de passe
   */
  static async verifyPassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Génère un UUID v4
   */
  static generateUUID() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  /**
   * Formate la monnaie XOF
   */
  static formatCurrency(amount, currency = 'XOF') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formate une date
   */
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options }).format(new Date(date));
  }

  /**
   * Calcule l'âge d'une date
   */
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Valide une date
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Vérifie si une date est dans le futur
   */
  static isFutureDate(dateString) {
    const date = new Date(dateString);
    return date > new Date();
  }

  /**
   * Vérifie si une date est dans le passé
   */
  static isPastDate(dateString) {
    const date = new Date(dateString);
    return date < new Date();
  }

  /**
   * Calcule la différence entre deux dates en jours
   */
  static daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  /**
   * Ajoute des jours à une date
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Nettoie et valide une chaîne de caractères
   */
  static sanitizeString(str, options = {}) {
    const {
      trim = true,
      lowercase = false,
      uppercase = false,
      removeSpecialChars = false,
      maxLength = null
    } = options;

    let cleaned = str;

    if (trim) {
      cleaned = cleaned.trim();
    }

    if (removeSpecialChars) {
      cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    if (lowercase) {
      cleaned = cleaned.toLowerCase();
    } else if (uppercase) {
      cleaned = cleaned.toUpperCase();
    }

    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }

    return cleaned;
  }

  /**
   * Crée une pagination
   */
  static createPagination(total, limit, offset) {
    const pages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const hasNextPage = currentPage < pages;
    const hasPrevPage = currentPage > 1;

    return {
      total,
      limit,
      offset,
      pages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null
    };
  }

  /**
   * Crée une réponse API standardisée
   */
  static createResponse(success, data = null, message = '', error = null, meta = {}) {
    const response = {
      success,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    if (error) {
      response.error = error;
    }

    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Extrait l'adresse IP d'une requête
   */
  static getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           '0.0.0.0';
  }

  /**
   * Génère un code de référence unique
   */
  static generateReferenceCode(prefix = 'TE') {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Valide la force d'un mot de passe
   */
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const issues = [];
    if (password.length < minLength) issues.push(`Au moins ${minLength} caractères`);
    if (!hasUpperCase) issues.push('Une lettre majuscule');
    if (!hasLowerCase) issues.push('Une lettre minuscule');
    if (!hasNumbers) issues.push('Un chiffre');
    if (!hasSpecialChar) issues.push('Un caractère spécial');

    return {
      isValid: issues.length === 0,
      score: 5 - issues.length,
      issues
    };
  }

  /**
   * Tronque un texte avec des ellipses
   */
  static truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Échappe les caractères HTML
   */
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Génère des couleurs aléatoires pour les graphiques
   */
  static generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360 / count) % 360;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  }

  /**
   * Calcule des statistiques simples
   */
  static calculateStats(numbers) {
    if (numbers.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const avg = sum / numbers.length;

    return {
      count: numbers.length,
      sum,
      avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
    };
  }

  /**
   * Retarde l'exécution (sleep)
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry une fonction avec backoff exponentiel
   */
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn(`Tentative ${attempt} échouée`, { error: error.message });
        
        if (attempt < maxAttempts) {
          await this.sleep(delay * Math.pow(2, attempt - 1));
        }
      }
    }
    
    throw lastError;
  }
}

module.exports = Helpers;
