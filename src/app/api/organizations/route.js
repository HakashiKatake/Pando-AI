import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/database';
import Organization from '@/models/Organization';

export async function POST(request) {
  try {
    // Get auth info from the request with more detailed logging
    console.log('Starting auth check...');
    const authResult = await auth();
    console.log('Auth result:', authResult);
    
    const { userId } = authResult;
    
    console.log('Auth userId:', userId);
    
    if (!userId) {
      console.log('No userId found in auth - user might not be authenticated');
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    console.log('Connecting to database...');
    await connectDB();

    const data = await request.json();
    console.log('Received data:', data);
    
    const organization = new Organization({
      ...data,
      userId,
      createdAt: new Date(),
    });

    console.log('Saving organization...');
    const savedOrganization = await organization.save();
    console.log('Organization saved successfully:', savedOrganization._id);

    return NextResponse.json(savedOrganization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization', details: error.message },
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

    await connectDB();

    const organization = await Organization.findOne({ userId });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
