import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { HabitCompletion } from '@/models/HabitCompletion';
import { auth } from '@clerk/nextjs/server';

await connectToDatabase();

export async function POST(request) {
  try {
    const body = await request.json();
    const { habitId, date, completed, userId } = body;
    
    if (!habitId || !date || userId === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: habitId, date, userId' },
        { status: 400 }
      );
    }

    // Find existing completion for this habit and date
    const existingCompletion = await HabitCompletion.findOne({
      habitId,
      date,
      userId
    });

    if (existingCompletion) {
      // Update existing completion
      existingCompletion.completed = completed;
      existingCompletion.timestamp = new Date();
      await existingCompletion.save();
      
      return NextResponse.json(existingCompletion);
    } else {
      // Create new completion
      const completion = new HabitCompletion({
        habitId,
        date,
        completed,
        userId,
        timestamp: new Date()
      });

      await completion.save();
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId');
    const habitId = searchParams.get('habitId');
    
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User ID or Guest ID required' },
        { status: 400 }
      );
    }

    const query = {
      $or: [
        { userId: userId },
        { userId: guestId }
      ]
    };

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
