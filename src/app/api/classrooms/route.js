import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Classroom from '@/models/Classroom';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    const classroom = new Classroom({
      ...data,
      createdAt: new Date(),
      students: [],
      studentCount: 0,
    });

    await classroom.save();

    return NextResponse.json(classroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    return NextResponse.json(
      { error: 'Failed to create classroom' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    await connectDB();

    const classrooms = await Classroom.find({ 
      organizationId: organizationId || userId 
    }).sort({ createdAt: -1 });

    return NextResponse.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classrooms' },
      { status: 500 }
    );
  }
}
