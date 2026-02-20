/**
 * Centralized Environment Variable Validation
 *
 * Validates all required environment variables at startup.
 * Provides safe accessors that throw descriptive errors
 * instead of silently returning undefined.
 *
 * USAGE:
 *   import { env } from '@/lib/env';
 *   const key = env.server.GOOGLE_GENAI_API_KEY; // throws if missing
 */

// ─── Server-Side Variables (never exposed to browser) ────────────────

interface ServerEnv {
    GOOGLE_GENAI_API_KEY: string;
    FIREBASE_SERVICE_ACCOUNT?: string;
    FIREBASE_PRIVATE_KEY?: string;
    FIREBASE_CLIENT_EMAIL?: string;
    SENTRY_DSN?: string;
}

function getServerEnv(): ServerEnv {
    if (typeof window !== 'undefined') {
        throw new Error('[env] Server env vars must not be accessed on the client.');
    }

    const googleKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleKey) {
        console.error('[env] CRITICAL: No AI API key found (GOOGLE_GENAI_API_KEY or GEMINI_API_KEY).');
    }

    return {
        GOOGLE_GENAI_API_KEY: googleKey ?? '',
        FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        SENTRY_DSN: process.env.SENTRY_DSN,
    };
}

// ─── Public Variables (safe for browser, prefixed NEXT_PUBLIC_) ──────

interface PublicEnv {
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
}

function getPublicEnv(): PublicEnv {
    const required: Record<string, string | undefined> = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const missing = Object.entries(required)
        .filter(([, v]) => !v)
        .map(([k]) => k);

    if (missing.length > 0) {
        console.error(`[env] Missing required public env vars: ${missing.join(', ')}`);
    }

    return {
        NEXT_PUBLIC_FIREBASE_API_KEY: required.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: required.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: required.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: required.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: required.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
        NEXT_PUBLIC_FIREBASE_APP_ID: required.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    };
}

// ─── Exported accessor ───────────────────────────────────────────────

export const env = {
    /** Server-only env vars — will throw if accessed on client */
    get server() {
        return getServerEnv();
    },
    /** Public env vars (NEXT_PUBLIC_*) — safe for client and server */
    get public() {
        return getPublicEnv();
    },
};
