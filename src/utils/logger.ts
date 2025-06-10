// Production-safe logger utility
const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.error(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
  
  // Safe logging that filters out sensitive data
  logSafe: (message: string, data?: any) => {
    if (isDevelopment || isDebugEnabled) {
      if (data) {
        const safeData = sanitizeLogData(data);
        console.log(message, safeData);
      } else {
        console.log(message);
      }
    }
  }
};

// Sanitize data to remove sensitive information
function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveKeys = [
    'password', 'token', 'authorization', 'auth_token', 
    'secret', 'key', 'credential', 'bearer'
  ];
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}

export default logger; 