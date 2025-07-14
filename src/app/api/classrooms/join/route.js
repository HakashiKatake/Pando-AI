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

    const { classroomId, studentId, studentEmail } = await request.json();

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Check if student is already in the classroom
    const isAlreadyJoined = classroom.students.some(
      student => student.userId === studentId
    );

    if (isAlreadyJoined) {
      return NextResponse.json({ error: 'Already joined this classroom' }, { status: 400 });
    }

    // Add student to classroom
    classroom.students.push({
      userId: studentId,
      email: studentEmail,
      joinedAt: new Date(),
    });

    classroom.studentCount = classroom.students.length;
    await classroom.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined classroom',
      classroom: {
        id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        code: classroom.code,
      }
    });
  } catch (error) {
    console.error('Error joining classroom:', error);
    return NextResponse.json(
      { error: 'Failed to join classroom' },
      { status: 500 }
    );
  }
}
