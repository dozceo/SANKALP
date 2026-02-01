import * as Sentry from "@sentry/nextjs";

type LogContext = Record<string, unknown>;

export const logger = {
  error: (error: Error | unknown, context?: LogContext) => {
    // Always log to console for visibility, but maybe structured differently in prod
    if (process.env.NODE_ENV !== 'production') {
      console.error('Logger caught error:', error, context);
    } else {
        // In production, we might want to reduce noise, but for now let's keep it
        // so we can see it in logs if we don't have Sentry keys yet.
        console.error('Production Error:', error, context);
    }

    // Send to Sentry
    Sentry.captureException(error, { extra: context });
  },

  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('Logger info:', message, context);
    }

    Sentry.captureMessage(message, { level: 'info', extra: context });
  }
};
