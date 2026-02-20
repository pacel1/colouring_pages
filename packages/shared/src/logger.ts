/**
 * Logger - Simple logging utility
 *
 * Standard logowania dla całego projektu
 *
 * ZASADY:
 * - Zawsze dodawaj kontekst ({ route, requestId, ... })
 * - NIGDY nie loguj sekretów!
 * - Używaj odpowiedniego poziomu
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  route?: string;
  requestId?: string;
  userId?: string;
  [key: string]: string | undefined;
}

/**
 * Formatuj log z kontekstem
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

/**
 * Debug log - szczegóły deweloperskie
 * Używaj do logowania szczegółów działania
 */
export function debug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(formatLog('debug', message, context));
  }
}

/**
 * Info log - normalne operacje
 * Używaj do logowania głównych operacji
 */
export function info(message: string, context?: LogContext): void {
  console.log(formatLog('info', message, context));
}

/**
 * Warn log - ostrzeżenia
 * Używaj do logowania ostrzeżeń
 */
export function warn(message: string, context?: LogContext): void {
  console.warn(formatLog('warn', message, context));
}

/**
 * Error log - błędy
 * Używaj do logowania błędów
 */
export function error(message: string, context?: LogContext): void {
  console.error(formatLog('error', message, context));
}

/**
 * Error log - błędy z stack trace
 * Używaj do logowania błędów z wyjątków
 */
export function errorWithStack(message: string, error: Error, context?: LogContext): void {
  const errorContext: LogContext = {
    ...context,
    errorMessage: error.message,
    errorStack: error.stack,
  };
  console.error(formatLog('error', message, errorContext));
}

/**
 * Logger - główny eksport
 * Używaj zamiast console.log() bezpośrednio
 */
export const logger = {
  debug,
  info,
  warn,
  error,
  errorWithStack,
};

export default logger;
