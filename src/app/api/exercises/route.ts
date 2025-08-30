import { NextResponse } from 'next/server';

type ExerciseLite = {
  id: string;
  name: string;
  mediaUrl?: string;
  muscleUrl?: string;
};

// Catálogo mínimo (podes expandir à vontade)
const EXERCISES: ExerciseLite[] = [
  {
    id: 'squat-bb',
    name: 'Barbell Back Squat',
    mediaUrl: '/exercises/squat.gif',
    muscleUrl: '/exercises/muscles/legs.png',
  },
  {
    id: 'bench-bb',
    name: 'Barbell Bench Press',
    mediaUrl: '/exercises/bench.gif',
    muscleUrl: '/exercises/muscles/chest.png',
  },
  {
    id: 'deadlift-bb',
    name: 'Barbell Deadlift',
    mediaUrl: '/exercises/deadlift.gif',
    muscleUrl: '/exercises/muscles/back.png',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    mediaUrl: '/exercises/latpulldown.gif',
    muscleUrl: '/exercises/muscles/lats.png',
  },
  {
    id: 'db-curl',
    name: 'Dumbbell Biceps Curl',
    mediaUrl: '/exercises/dbcurl.gif',
    muscleUrl: '/exercises/muscles/biceps.png',
  },
  {
    id: 'triceps-rope',
    name: 'Triceps Rope Pushdown',
    mediaUrl: '/exercises/tricepsrope.gif',
    muscleUrl: '/exercises/muscles/triceps.png',
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const out = EXERCISES.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 25);
  return NextResponse.json(out);
}
