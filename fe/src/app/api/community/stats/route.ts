import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock community statistics
    const mockStats = {
      totalUsers: 1250,
      totalQueries: 15600,
      totalEarnings: '45.7',
      activeUsers: 750
    };

    return NextResponse.json({ 
      success: true, 
      data: mockStats 
    });
  } catch (error) {
    console.error('Community stats API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch community stats' },
      { status: 500 }
    );
  }
}
