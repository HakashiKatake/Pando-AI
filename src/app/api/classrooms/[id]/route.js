import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Classroom from '@/models/Classroom';

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const classroom = await Classroom.findOne({
      _id: params.id,
      teacherId: userId
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json(classroom);
    
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classroom' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, subject, description } = body;

    await connectDB();
    
    const classroom = await Classroom.findOneAndUpdate(
      { _id: params.id, teacherId: userId },
      { name, subject, description, updatedAt: new Date() },
      { new: true }
    );

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json(classroom);
    
  } catch (error) {
    console.error('Error updating classroom:', error);
    return NextResponse.json(
      { error: 'Failed to update classroom' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const classroom = await Classroom.findOneAndDelete({
      _id: params.id,
      teacherId: userId
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Classroom deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json(
      { error: 'Failed to delete classroom' },
      { status: 500 }
    );
  }
}
