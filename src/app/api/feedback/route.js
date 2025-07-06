import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import FeedbackEntry from '../../../models/FeedbackEntry';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const body = await request.json();
    const { 
      type, 
      title, 
      content, 
      guestId, 
      tags, 
      category, 
      mood, 
      isPrivate = true,
      rating 
    } = body;
    
    // Validate required fields
    if (!type || !content?.trim()) {
      return NextResponse.json(
        { error: 'Type and content are required' },
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
    
    // Create feedback entry data
    const entryData = {
      type,
      title: title || '',
      content: content.trim(),
      tags: tags || [],
      category: category || 'general',
      mood: mood ? parseInt(mood) : undefined,
      isPrivate,
      rating: rating ? parseInt(rating) : undefined,
    };
    
    // Add user or guest ID
    if (userId) {
      entryData.userId = userId;
    } else {
      entryData.guestId = guestId;
    }
    
    // Create the entry
    const feedbackEntry = await FeedbackEntry.create(entryData);
    
    return NextResponse.json({
      success: true,
      data: feedbackEntry,
      message: 'Entry saved successfully'
    });
    
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to save entry', details: error.message },
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
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const search = searchParams.get('search');
    
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
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    
    // Don't show archived entries by default
    query.isArchived = { $ne: true };
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch entries
    const entries = await FeedbackEntry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCount = await FeedbackEntry.countDocuments(query);
    
    // Calculate statistics
    const stats = await FeedbackEntry.aggregate([
      { $match: session?.user?.id ? { userId: session.user.id } : { guestId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          entryTypes: { $addToSet: '$type' },
          avgMood: { $avg: '$mood' },
          avgRating: { $avg: '$rating' },
          totalWords: { $sum: '$wordCount' },
        }
      }
    ]);
    
    // Get recent activity (entries by day for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await FeedbackEntry.aggregate([
      {
        $match: {
          ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          types: { $addToSet: '$type' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      stats: stats[0] || {
        totalEntries: 0,
        entryTypes: [],
        avgMood: 0,
        avgRating: 0,
        totalWords: 0,
      },
      recentActivity,
    });
    
  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const body = await request.json();
    const { id, guestId, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
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
    
    // Build query to ensure user owns the entry
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    } else {
      query.guestId = guestId;
    }
    
    // Update the entry
    const updatedEntry = await FeedbackEntry.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );
    
    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Entry not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Entry updated successfully'
    });
    
  } catch (error) {
    console.error('Feedback PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const guestId = searchParams.get('guestId');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
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
    
    // Build query to ensure user owns the entry
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    } else {
      query.guestId = guestId;
    }
    
    // Delete the entry
    const deletedEntry = await FeedbackEntry.findOneAndDelete(query);
    
    if (!deletedEntry) {
      return NextResponse.json(
        { error: 'Entry not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Feedback DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry', details: error.message },
      { status: 500 }
    );
  }
}
