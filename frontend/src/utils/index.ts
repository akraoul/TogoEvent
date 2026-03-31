import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// Date utilities
export const formatDate = (date: string | Date, formatStr: string = 'dd MMMM yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Date formatting error:', error);
    return date;
  }
};

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'dd MMMM yyyy à HH:mm');
};

export const formatDateShort = (date: string | Date) => {
  return formatDate(date, 'dd MMM yyyy');
};

export const isEventUpcoming = (startDate: string | Date) => {
  const eventDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = new Date();
  return eventDate > now;
};

export const isEventPast = (endDate: string | Date) => {
  const eventDate = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const now = new Date();
  return eventDate < now;
};

export const getEventStatus = (startDate: string | Date, endDate: string | Date) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const now = new Date();

  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
};

// Currency utilities
export const formatCurrency = (amount: number, currency: string = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPrice = (price: number, currency: string = 'XOF') => {
  return formatCurrency(price, currency);
};

// String utilities
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Array utilities
export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const uniqueBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// Storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue || null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};
