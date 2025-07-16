import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Report from '@/models/Report';
import Classroom from '@/models/Classroom';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { 
      classroomId, 
      reportType, 
      title, 
      description, 
      severity, 
      location, 
      incidentDate, 
      witnessCount, 
      isRecurring 
    } = data;

    // Verify the user is a student in this classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    const isStudentInClassroom = classroom.students.some(student => student.userId === userId);
    if (!isStudentInClassroom) {
      return NextResponse.json({ error: 'You are not a member of this classroom' }, { status: 403 });
    }

    // Create anonymous hash for the student (prevents duplicate reports within 24h)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const studentHash = crypto.createHash('sha256')
      .update(`${userId}-${classroomId}-${today}`)
      .digest('hex');

    // Check for duplicate report from same student today (for same report type)
    const existingReport = await Report.findOne({
      classroomId,
      studentHash,
      reportType,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
      }
    });

    if (existingReport) {
      return NextResponse.json({ 
        error: 'You have already submitted a report of this type today. Please contact your teacher directly if this is urgent.' 
      }, { status: 429 });
    }

    // Create the report
    const report = new Report({
      classroomId,
      organizationId: classroom.organizationId,
      reportType,
      title: title.substring(0, 100), // Ensure length limit
      description: description.substring(0, 1000), // Ensure length limit
      severity: severity || 'medium',
      location: location?.substring(0, 100),
      incidentDate: incidentDate ? new Date(incidentDate) : undefined,
      witnessCount: witnessCount || 0,
      isRecurring: isRecurring || false,
      studentHash,
      isAnonymous: true,
    });

    await report.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Report submitted successfully. Your teacher/organization will review it.',
      reportId: report._id 
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
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
    const classroomId = searchParams.get('classroomId');
    const organizationId = searchParams.get('organizationId');

    await connectDB();

    let query = {};
    
    if (organizationId) {
      // Organization admin viewing all reports
      query.organizationId = organizationId;
    } else if (classroomId) {
      // Classroom-specific reports (for teachers/admins)
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
      }
      
      // Verify user has access to this classroom (is the creator or organization admin)
      if (classroom.createdBy !== userId && classroom.organizationId !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      query.classroomId = classroomId;
    } else {
      return NextResponse.json({ error: 'classroomId or organizationId required' }, { status: 400 });
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .select('-studentHash') // Never expose the student hash
      .limit(100); // Limit for performance

    return NextResponse.json(reports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
