import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Classroom from '@/models/Classroom';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Classroom code is required' }, { status: 400 });
    }

    await connectDB();

    const classroom = await Classroom.findOne({ code: code.toUpperCase() });

    if (!classroom) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid classroom code' 
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      classroom: {
        id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        description: classroom.description,
        code: classroom.code,
        studentCount: classroom.studentCount || 0,
      }
    });
  } catch (error) {
    console.error('Error verifying classroom code:', error);
    return NextResponse.json(
      { error: 'Failed to verify classroom code' },
      { status: 500 }
    );
  }
}
