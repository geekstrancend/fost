import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getUserStats, updateUserStats, incrementSdkGenerated } from '@/lib/stats-storage';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user stats from persistent storage
    const stats = await getUserStats(auth.user.id);

    return NextResponse.json(
      {
        user: auth.user.email,
        stats,
        plan: auth.user.plan,
        creditsRemaining: Math.max(0, auth.user.credits - stats.creditsUsed),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, isWeb3 } = await request.json();

    let stats;
    
    // Update stats based on action
    switch (action) {
      case 'sdk-generated':
        stats = await incrementSdkGenerated(auth.user.id, isWeb3 === true);
        break;
      
      case 'spec-processed':
        const currentStats = await getUserStats(auth.user.id);
        stats = await updateUserStats(auth.user.id, {
          apiSpecsProcessed: currentStats.apiSpecsProcessed + 1,
        });
        break;
      
      case 'language-added':
        // Will be handled when SDK is generated
        stats = await getUserStats(auth.user.id);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user statistics' },
      { status: 500 }
    );
  }
}
