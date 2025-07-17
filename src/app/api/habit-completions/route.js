import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { HabitCompletion } from '@/models/HabitCompletion';
import { auth } from '@clerk/nextjs/server';

await connectToDatabase();

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth();
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { habitId, date, completed } = body;
    
    console.log('Habit completion API received:', { authUserId, body });
    
    if (!habitId || !date || completed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: habitId, date, completed' },
        { status: 400 }
      );
    }

    // Find existing completion for this habit and date
    const existingCompletion = await HabitCompletion.findOne({
      habitId,
      date,
      userId: authUserId
    });

    if (existingCompletion) {
      // Update existing completion
      existingCompletion.completed = completed;
      existingCompletion.timestamp = new Date();
      await existingCompletion.save();
      
      console.log('Updated existing habit completion:', existingCompletion);
      return NextResponse.json(existingCompletion);
    } else {
      // Create new completion
      const completion = new HabitCompletion({
        habitId,
        date,
        completed,
        userId: authUserId, // Always use authenticated user's ID
        timestamp: new Date()
      });

      await completion.save();
      console.log('Created new habit completion:', completion);
      return NextResponse.json(completion);
    }
  } catch (error) {
    console.error('Error saving habit completion:', error);
    return NextResponse.json(
      { error: 'Failed to save habit completion' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId: authUserId } = auth();
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');
    
    const query = { userId: authUserId };

    if (habitId) {
      query.habitId = habitId;
    }

    const completions = await HabitCompletion.find(query);

    return NextResponse.json({
      success: true,
      completions
    });
  } catch (error) {
    console.error('Error fetching habit completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit completions' },
      { status: 500 }
    );
  }
}
