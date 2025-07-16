import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Habit } from '@/models/Habit';
import { HabitCompletion } from '@/models/HabitCompletion';
import { auth } from '@clerk/nextjs/server';

await connectToDatabase();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId');
    
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User ID or Guest ID required' },
        { status: 400 }
      );
    }

    const habits = await Habit.find({ 
      $or: [
        { userId: userId },
        { userId: guestId }
      ]
    }).sort({ createdAt: -1 });

    // Get habit completions from the database
    const habitCompletions = await HabitCompletion.find({ 
      $or: [
        { userId: userId },
        { userId: guestId }
      ]
    });

    // Transform completions to the format expected by the frontend
    const completions = {};
    habitCompletions.forEach(completion => {
      const key = `${completion.habitId}-${completion.date}`;
      completions[key] = completion.completed;
    });

    return NextResponse.json({
      success: true,
      habits,
      completions
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    
    const habit = new Habit({
      ...body,
      userId: body.userId || userId,
      createdAt: new Date(),
    });

    await habit.save();

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('id');
    
    if (!habitId) {
      return NextResponse.json(
        { error: 'Habit ID required' },
        { status: 400 }
      );
    }

    await Habit.findByIdAndDelete(habitId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
