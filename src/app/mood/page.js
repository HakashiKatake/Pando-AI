"use client";
import MoodMusicPlayer from '../../components/MoodMusicPlayer';

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]">
      <MoodMusicPlayer />
    </main>
  );
}
