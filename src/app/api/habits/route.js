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
    
    console.log('Habits API called with userId:', userId);
    
    // Only allow authenticated users to access the API
    if (!userId) {
      console.log('No userId provided in request');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Verify authentication - try both server-side and client-side methods
    let authUserId = null;
    
    // Try server-side auth first
    const { userId: serverAuthUserId } = auth();
    authUserId = serverAuthUserId;
    
    // If server-side auth doesn't work, try client-side Bearer token
    if (!authUserId) {
      const authHeader = request.headers.get('authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import('@clerk/nextjs/server');
          const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });
          authUserId = verified.sub;
        } catch (tokenError) {
          console.error('Token verification failed:', tokenError);
        }
      }
    }
    
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const habits = await Habit.find({ userId: userId }).sort({ createdAt: -1 });

    // Transform habits to use id instead of _id for frontend compatibility
    const transformedHabits = habits.map(habit => ({
      ...habit.toObject(),
      id: habit._id.toString(),
      _id: undefined
    }));

    // Get habit completions from the database
    const habitCompletions = await HabitCompletion.find({ userId: userId });

    // Transform completions to the format expected by the frontend
    const completions = {};
    habitCompletions.forEach(completion => {
      const key = `${completion.habitId}-${completion.date}`;
      completions[key] = completion.completed;
    });

    return NextResponse.json({
      success: true,
      habits: transformedHabits,
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
    // Use the same dual authentication approach as GET
    let authUserId = null;
    
    // Try server-side auth first
    const { userId: serverAuthUserId } = auth();
    authUserId = serverAuthUserId;
    
    // If server-side auth doesn't work, try client-side Bearer token
    if (!authUserId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import('@clerk/nextjs/server');
          const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });
          authUserId = verified.sub;
        } catch (tokenError) {
          console.error('Token verification failed in POST:', tokenError);
        }
      }
    }
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Creating habit for userId:', authUserId, 'with data:', body);
    
    const habit = new Habit({
      ...body,
      userId: authUserId, // Always use the authenticated user's ID
      createdAt: new Date(),
    });

    await habit.save();
    console.log('Habit saved successfully:', habit._id);

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
    // Use the same dual authentication approach
    let authUserId = null;
    
    // Try server-side auth first
    const { userId: serverAuthUserId } = auth();
    authUserId = serverAuthUserId;
    
    // If server-side auth doesn't work, try client-side Bearer token
    if (!authUserId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import('@clerk/nextjs/server');
          const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });
          authUserId = verified.sub;
        } catch (tokenError) {
          console.error('Token verification failed in DELETE:', tokenError);
        }
      }
    }
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('id');
    
    if (!habitId) {
      return NextResponse.json(
        { error: 'Habit ID required' },
        { status: 400 }
      );
    }

    // Ensure user can only delete their own habits
    await Habit.findOneAndDelete({ _id: habitId, userId: authUserId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
