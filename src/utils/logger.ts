import pino, { Logger } from 'pino';

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Configuration for structured logging
const baseConfig = {
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      customPrettifiers: {
        time: (timestamp: string) => `🕐 ${new Date(timestamp).toLocaleTimeString()}`,
      },
    },
  } : undefined,
  browser: {
    asObject: true,
    serialize: true,
    transmit: {
      level: 'error',
      send: (_level: string, logEvent: unknown) => {
        if (isProduction) {
          // Send to monitoring service in production
          console.error('[PINO ERROR]', logEvent);
        }
      },
    },
  },
  base: {
    pid: undefined,
    hostname: undefined,
    env: isDevelopment ? 'development' : 'production',
    app: 'BlancAlergic-APP',
    version: '10.0.2',
    session: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

export const logger = pino(baseConfig);

// Medical-specific logger with HIPAA compliance considerations
export const medicalLogger = logger.child({
  module: 'medical',
  category: 'healthcare',
  compliance: 'HIPAA',
});

// Authentication logger with security context
export const authLogger = logger.child({
  module: 'authentication',
  category: 'security',
});

// Performance logger for metrics
export const performanceLogger = logger.child({
  module: 'performance',
  category: 'metrics',
});

// Error boundary logger with enhanced context
export const errorLogger = logger.child({
  module: 'error-boundary',
  category: 'error-handling',
});

// Utility functions for structured logging
export const createChildLogger = (context: Record<string, unknown>, module: string): Logger => {
  return logger.child({
    ...context,
    module,
    timestamp: new Date().toISOString(),
  });
};

// Performance measurement helper
export const measurePerformance = <T>(name: string, fn: () => Promise<T> | T) => {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result
      .then(async (value) => {
        const duration = performance.now() - start;
        performanceLogger.info({
          operation: name,
          duration: Math.round(duration * 100) / 100,
          success: true,
        }, `Performance: ${name}`);
        return value;
      })
      .catch(async (error: unknown) => {
        const duration = performance.now() - start;
        performanceLogger.error({
          operation: name,
          duration: Math.round(duration * 100) / 100,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, `Performance: ${name} failed`);
        throw error;
      });
  } else {
    const duration = performance.now() - start;
    performanceLogger.info({
      operation: name,
      duration: Math.round(duration * 100) / 100,
      success: true,
    }, `Performance: ${name}`);
    return result;
  }
};

// Medical operation logger with sanitization
export const logMedicalOperation = (operation: string, userId: string, data?: Record<string, unknown>) => {
  // Sanitize PHI data in production
  const sanitizedData = isProduction ? {
    userId: userId.substring(0, 6) + '***',
    operation,
    timestamp: new Date().toISOString(),
  } : {
    userId,
    operation,
    data,
    timestamp: new Date().toISOString(),
  };

  medicalLogger.info(sanitizedData, `Medical operation: ${operation}`);
};

// Security event logger
export const logSecurityEvent = (event: string, userId?: string, details?: Record<string, unknown>) => {
  authLogger.warn({
    event,
    userId: isProduction ? (userId?.substring(0, 6) + '***') : userId,
    timestamp: new Date().toISOString(),
    ip: details?.ip,
    userAgent: details?.userAgent,
    severity: 'medium',
    ...details,
  }, `Security event: ${event}`);
};

export default logger;