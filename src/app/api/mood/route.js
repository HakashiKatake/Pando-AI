import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import MoodEntry from '../../../models/MoodEntry';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const body = await request.json();
    const { mood, emoji, note, guestId, tags, activities, energy, anxiety, sleep } = body;
    
    // Validate required fields
    if (!mood || !emoji) {
      return NextResponse.json(
        { error: 'Mood and emoji are required' },
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
    
    // Create mood entry data
    const moodData = {
      mood: parseInt(mood),
      emoji,
      note: note || '',
      tags: tags || [],
      activities: activities || [],
      energy: energy ? parseInt(energy) : undefined,
      anxiety: anxiety ? parseInt(anxiety) : undefined,
      sleep: sleep || undefined,
      date: new Date(),
    };
    
    // Add user or guest ID
    if (userId) {
      moodData.userId = userId;
    } else {
      moodData.guestId = guestId;
    }
    
    // Check if mood entry already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingMood = await MoodEntry.findOne({
      ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      date: { $gte: today, $lt: tomorrow },
    });
    
    let moodEntry;
    if (existingMood) {
      // Update existing mood entry
      Object.assign(existingMood, moodData);
      moodEntry = await existingMood.save();
    } else {
      // Create new mood entry
      moodEntry = await MoodEntry.create(moodData);
    }
    
    return NextResponse.json({
      success: true,
      data: moodEntry,
      message: existingMood ? 'Mood updated successfully' : 'Mood recorded successfully'
    });
    
  } catch (error) {
    console.error('Mood API error:', error);
    return NextResponse.json(
      { error: 'Failed to record mood', details: error.message },
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
    const days = parseInt(searchParams.get('days')) || 30;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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
    
    // Add date filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const since = new Date();
      since.setDate(since.getDate() - days);
      query.date = { $gte: since };
    }
    
    // Fetch mood entries
    const moods = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    // Calculate statistics
    const stats = {
      totalEntries: moods.length,
      averageMood: moods.length > 0 
        ? Math.round((moods.reduce((sum, m) => sum + m.mood, 0) / moods.length) * 10) / 10
        : 0,
      moodDistribution: {},
      recentTrend: null,
    };
    
    // Calculate mood distribution
    moods.forEach(mood => {
      stats.moodDistribution[mood.mood] = (stats.moodDistribution[mood.mood] || 0) + 1;
    });
    
    // Calculate recent trend (last 7 days vs previous 7 days)
    if (moods.length >= 7) {
      const recent = moods.slice(0, 7);
      const previous = moods.slice(7, 14);
      
      const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
      const previousAvg = previous.length > 0 
        ? previous.reduce((sum, m) => sum + m.mood, 0) / previous.length 
        : recentAvg;
      
      stats.recentTrend = recentAvg - previousAvg;
    }
    
    return NextResponse.json({
      success: true,
      data: moods,
      stats,
    });
    
  } catch (error) {
    console.error('Mood GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood data', details: error.message },
      { status: 500 }
    );
  }
}
