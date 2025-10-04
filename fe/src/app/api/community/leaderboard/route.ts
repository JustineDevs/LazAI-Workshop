import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'earnings';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock leaderboard data
    const mockLeaderboard = [
      { address: '0xCreator1...', totalEarnings: '10.5', totalQueries: 1500, performanceScore: 95, rank: 1 },
      { address: '0xCreator2...', totalEarnings: '8.2', totalQueries: 1200, performanceScore: 90, rank: 2 },
      { address: '0xCreator3...', totalEarnings: '5.1', totalQueries: 800, performanceScore: 85, rank: 3 },
      { address: '0xCreator4...', totalEarnings: '3.7', totalQueries: 600, performanceScore: 80, rank: 4 },
      { address: '0xCreator5...', totalEarnings: '2.9', totalQueries: 400, performanceScore: 75, rank: 5 },
    ];

    // Sort by the specified criteria
    const sortedLeaderboard = mockLeaderboard.sort((a, b) => {
      if (sortBy === 'earnings') {
        return parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings);
      } else {
        return b.totalQueries - a.totalQueries;
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: sortedLeaderboard.slice(0, limit) 
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
