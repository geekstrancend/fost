import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, formatUserResponse } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user information
 * 
 * Returns:
 *   - 200: Current user data
 *   - 401: Not authenticated
 *   - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const userData = formatUserResponse(auth.user);

    return NextResponse.json(userData, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (error instanceof Error) {
      console.error('[Auth Check Error]', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      console.error('[Auth Check Error]', error);
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'AUTH_CHECK_FAILED'
      },
      { status: 500 }
    );
  }
}
