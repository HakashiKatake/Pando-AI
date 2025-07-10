import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/music?mood=sad
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood');
  if (!mood) {
    return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
  }
  const musicDir = path.join(process.cwd(), 'public', 'music', mood);
  try {
    const files = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3'));
    // Return URLs for the frontend to use
    const urls = files.map(f => `/music/${mood}/${f}`);
    return NextResponse.json({ mood, urls });
  } catch (e) {
    return NextResponse.json({ error: 'No music found for this mood' }, { status: 404 });
  }
}
