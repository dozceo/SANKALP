/**
 * Authentication Middleware for API Routes
 * Verifies Firebase ID tokens and extracts user info
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: DecodedIdToken;
}

/**
 * Verify Firebase ID token from request headers
 */
export async function verifyAuth(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: DecodedIdToken;
    error?: string;
}> {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authenticated: false,
                error: 'No authorization token provided'
            };
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return {
                authenticated: false,
                error: 'Invalid authorization token format'
            };
        }

        // Verify the token with Firebase Admin SDK
        const decodedToken = await auth.verifyIdToken(token);

        return {
            authenticated: true,
            user: decodedToken
        };
    } catch (error: any) {
        console.error('Auth verification failed:', error);

        return {
            authenticated: false,
            error: error.code === 'auth/id-token-expired'
                ? 'Token expired'
                : 'Invalid token'
        };
    }
}

/**
 * Middleware wrapper for API routes requiring authentication
 */
export function withAuth<T = any>(
    handler: (request: AuthenticatedRequest, user: DecodedIdToken) => Promise<NextResponse<T>>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const authResult = await verifyAuth(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add user to request
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = authResult.user;

        return handler(authenticatedRequest, authResult.user);
    };
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
}
