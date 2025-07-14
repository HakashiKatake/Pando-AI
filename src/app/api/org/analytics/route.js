import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Classroom from '@/models/Classroom';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    await connectDB();

    // Get classrooms for this organization
    const classrooms = await Classroom.find({ 
      organizationId: organizationId || userId 
    });

    // Calculate analytics
    const totalStudents = classrooms.reduce((sum, classroom) => 
      sum + (classroom.studentCount || 0), 0
    );

    // For now, we'll use mock data for wellness metrics
    // In a real implementation, you'd query actual student wellness data
    const analytics = {
      totalStudents,
      activeStudents: Math.floor(totalStudents * 0.8), // 80% active
      averageWellness: 7.2, // Mock average wellness score
      alertCount: Math.floor(totalStudents * 0.1), // 10% might have alerts
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
