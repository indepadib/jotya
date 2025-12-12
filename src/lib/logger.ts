// Structured logging utility for production-ready error tracking

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    userId?: string;
    itemId?: string;
    transactionId?: string;
    [key: string]: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            console.log(this.formatMessage('debug', message, context));
        }
    }

    info(message: string, context?: LogContext) {
        console.log(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: LogContext) {
        console.warn(this.formatMessage('warn', message, context));
        // In production, send to external service (Sentry, LogRocket, etc.)
        if (!this.isDevelopment) {
            // Example: sendToLoggingService('warn', message, context);
        }
    }

    error(message: string, error?: Error, context?: LogContext) {
        const errorContext = {
            ...context,
            error: error?.message,
            stack: error?.stack
        };
        console.error(this.formatMessage('error', message, errorContext));

        // In production, send to error tracking service
        if (!this.isDevelopment) {
            // Example: Sentry.captureException(error, { extra: context });
        }
    }
}

export const logger = new Logger();
