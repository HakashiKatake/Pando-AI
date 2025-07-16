import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Report from '@/models/Report';
import Classroom from '@/models/Classroom';

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const data = await request.json();
    const { status, adminNotes } = data;

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Verify user has permission to update this report
    const classroom = await Classroom.findById(report.classroomId);
    if (!classroom) {
      return NextResponse.json({ error: 'Associated classroom not found' }, { status: 404 });
    }

    // Only organization admin or classroom creator can update reports
    if (classroom.organizationId !== userId && classroom.createdBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the report
    const updateData = {
      updatedAt: new Date()
    };

    if (status && ['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      updateData.status = status;
      
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes.substring(0, 500); // Ensure length limit
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-studentHash' }
    );

    return NextResponse.json(updatedReport);

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
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

    const { id } = params;

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Verify user has permission to delete this report (only organization admin)
    if (report.organizationId !== userId) {
      return NextResponse.json({ error: 'Only organization admins can delete reports' }, { status: 403 });
    }

    await Report.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Report deleted successfully' });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
