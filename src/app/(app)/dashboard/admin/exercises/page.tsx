import * as React from 'react';
import ExercisesClient from './exercises.client';

export const dynamic = 'force-dynamic';

export default function AdminExercisesPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>Exercícios</h1>
      <ExercisesClient />
    </div>
  );
}
