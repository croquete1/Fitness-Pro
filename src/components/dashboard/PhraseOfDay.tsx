// src/components/dashboard/PhraseOfDay.tsx
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { brand } from '@/lib/brand';

export default async function PhraseOfDay() {
  const sb = tryCreateServerClient();
  let phrases: { text: string; author?: string | null }[] = [];
  if (!sb) {
    phrases = [
      { text: 'Foco, disciplina e consistência 💪', author: brand.name },
      { text: 'Pequenos passos todos os dias.' },
      { text: 'O progresso é o que interessa.' },
    ];
  } else {
    try {
      const { data } = await sb
        .from('motivational_quotes')
        .select('text,author')
        .eq('active', true)
        .limit(200);
      phrases = data ?? [];
    } catch {
      phrases = [];
    }
  }

  if (phrases.length === 0) {
    phrases = [
      { text: 'Foco, disciplina e consistência 💪', author: brand.name },
      { text: 'Pequenos passos todos os dias.' },
      { text: 'O progresso é o que interessa.' },
    ];
  }

  const todayIdx = Math.floor(
    (Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - Date.UTC(new Date().getFullYear(), 0, 0)) /
      86400000
  );
  const pick = phrases[todayIdx % phrases.length];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: .5 }}>
        Frase do dia
      </Typography>
      <Typography sx={{ fontWeight: 700, letterSpacing: .2 }}>
        “{pick.text}”
      </Typography>
      {pick.author && (
        <Typography variant="caption" sx={{ opacity: .7 }}>— {pick.author}</Typography>
      )}
    </Paper>
  );
}
