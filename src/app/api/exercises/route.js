import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import ExerciseSession from '../../../models/ExerciseSession';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const body = await request.json();
    const { 
      exerciseType, 
      duration, 
      completed, 
      effectiveness,
      moodBefore,
      moodAfter,
      notes,
      guestId,
      sessionData,
      environment
    } = body;
    
    // Validate required fields
    if (!exerciseType || !duration) {
      return NextResponse.json(
        { error: 'Exercise type and duration are required' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated or guest
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User authentication or guest ID required' },
        { status: 401 }
      );
    }
    
    // Create exercise session data
    const sessionDataObj = {
      exerciseType,
      duration: parseInt(duration),
      completed: completed || false,
      effectiveness: effectiveness ? parseInt(effectiveness) : undefined,
      moodBefore: moodBefore ? parseInt(moodBefore) : undefined,
      moodAfter: moodAfter ? parseInt(moodAfter) : undefined,
      notes: notes || '',
      sessionData: sessionData || {},
      environment: environment || {},
    };
    
    // Add user or guest ID
    if (userId) {
      sessionDataObj.userId = userId;
    } else {
      sessionDataObj.guestId = guestId;
    }
    
    // Create the session
    const exerciseSession = await ExerciseSession.create(sessionDataObj);
    
    return NextResponse.json({
      success: true,
      data: exerciseSession,
      message: 'Exercise session recorded successfully'
    });
    
  } catch (error) {
    console.error('Exercise API error:', error);
    return NextResponse.json(
      { error: 'Failed to record exercise session', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    const exerciseType = searchParams.get('exerciseType');
    const days = parseInt(searchParams.get('days')) || 30;
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    // Check if user is authenticated or guest
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User authentication or guest ID required' },
        { status: 401 }
      );
    }
    
    // Build query
    const query = userId 
      ? { userId }
      : { guestId };
    
    // Add filters
    if (exerciseType) query.exerciseType = exerciseType;
    
    // Add date filter
    const since = new Date();
    since.setDate(since.getDate() - days);
    query.createdAt = { $gte: since };
    
    // Fetch exercise sessions
    const sessions = await ExerciseSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Calculate statistics
    const stats = await ExerciseSession.aggregate([
      { $match: userId ? { userId } : { guestId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          totalMinutes: {
            $sum: { $divide: ['$duration', 60] }
          },
          avgEffectiveness: { $avg: '$effectiveness' },
          avgMoodImprovement: {
            $avg: {
              $subtract: ['$moodAfter', '$moodBefore']
            }
          },
          exerciseTypes: { $addToSet: '$exerciseType' },
        }
      }
    ]);
    
    // Get exercise type distribution
    const typeDistribution = await ExerciseSession.aggregate([
      { $match: userId ? { userId } : { guestId } },
      {
        $group: {
          _id: '$exerciseType',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgEffectiveness: { $avg: '$effectiveness' },
          completionRate: {
            $avg: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get weekly progress
    const weeklyProgress = await ExerciseSession.aggregate([
      {
        $match: {
          ...(userId ? { userId } : { guestId }),
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          sessions: { $sum: 1 },
          totalMinutes: { $sum: { $divide: ['$duration', 60] } },
          completedSessions: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: sessions,
      stats: stats[0] || {
        totalSessions: 0,
        completedSessions: 0,
        totalMinutes: 0,
        avgEffectiveness: 0,
        avgMoodImprovement: 0,
        exerciseTypes: [],
      },
      typeDistribution,
      weeklyProgress,
    });
    
  } catch (error) {
    console.error('Exercise GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise data', details: error.message },
      { status: 500 }
    );
  }
}
