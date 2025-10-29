// src/components/questionnaire/FitnessQuestionnaireSummary.tsx
import type { QuestionnaireNormalized } from '@/lib/questionnaire';
import { QUESTIONNAIRE_WEEKDAY_LABEL } from '@/lib/questionnaire';

type Props = {
  data: QuestionnaireNormalized;
  variant?: 'full' | 'compact';
};

export default function FitnessQuestionnaireSummary({ data, variant = 'full' }: Props) {
  const days = data.schedule.days.map((day) => QUESTIONNAIRE_WEEKDAY_LABEL[day]).join(', ');
  const hasDays = Boolean(days);
  const updatedLabel = data.updatedAt ? formatDate(data.updatedAt) : data.createdAt ? formatDate(data.createdAt) : null;

  return (
    <div className={`questionnaire-summary questionnaire-summary--${variant}`}>
      <header className="questionnaire-summary__header">
        <div>
          <h3>Informação geral</h3>
          <p>Última actualização {updatedLabel ?? '—'}</p>
        </div>
        <span className={`questionnaire-summary__badge questionnaire-summary__badge--${data.status}`}>
          {data.status === 'submitted' ? 'Submetido' : 'Pendente'}
        </span>
      </header>

      <section className="questionnaire-summary__section">
        <h4>Contexto</h4>
        <dl>
          <div>
            <dt>Profissão</dt>
            <dd>{data.job ?? '—'}</dd>
          </div>
          <div>
            <dt>Actividade diária</dt>
            <dd>{data.activity}</dd>
          </div>
          <div>
            <dt>Objectivo</dt>
            <dd>{data.objective ?? '—'}</dd>
          </div>
          <div>
            <dt>Bem-estar (0-5)</dt>
            <dd>{data.wellbeing ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="questionnaire-summary__section">
        <h4>Anamnese</h4>
        <dl>
          {Object.entries(data.anamnesis).map(([key, value]) => (
            <div key={key}>
              <dt>{ANAMNESIS_LABELS[key as keyof typeof ANAMNESIS_LABELS]}</dt>
              <dd>{value ? value : '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="questionnaire-summary__section">
        <h4>Disponibilidade</h4>
        <p>{hasDays ? days : 'Sem preferências indicadas.'}</p>
        {data.schedule.notes ? <p className="questionnaire-summary__notes">{data.schedule.notes}</p> : null}
      </section>

      <section className="questionnaire-summary__section questionnaire-summary__section--columns">
        <div>
          <h4>Métricas corporais</h4>
          <dl>
            {Object.keys(BODY_LABELS).map((key) => {
              const typedKey = key as keyof typeof BODY_LABELS;
              const value = data.metrics.body[typedKey];
              return (
                <div key={key}>
                  <dt>{BODY_LABELS[typedKey]}</dt>
                  <dd>{value ? value : '—'}</dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div>
          <h4>Perímetros</h4>
          <dl>
            {Object.keys(PERIMETER_LABELS).map((key) => {
              const typedKey = key as keyof typeof PERIMETER_LABELS;
              const value = data.metrics.perimeters[typedKey];
              return (
                <div key={key}>
                  <dt>{PERIMETER_LABELS[typedKey]}</dt>
                  <dd>{value ? value : '—'}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {(data.metrics.notes || data.metrics.observations || data.summary) && (
        <section className="questionnaire-summary__section">
          <h4>Notas adicionais</h4>
          {data.summary ? <p className="questionnaire-summary__notes">{data.summary}</p> : null}
          {data.metrics.notes ? <p className="questionnaire-summary__notes">{data.metrics.notes}</p> : null}
          {data.metrics.observations ? <p className="questionnaire-summary__notes">{data.metrics.observations}</p> : null}
        </section>
      )}
    </div>
  );
}

const ANAMNESIS_LABELS = {
  cardiac: 'Patologias cardíacas',
  familyHistory: 'Histórico familiar',
  hypertension: 'Hipertensão',
  respiratory: 'Respiratórias',
  diabetes: 'Diabetes',
  cholesterol: 'Colesterol',
  other: 'Outras patologias',
  smokeDrink: 'Consumo tabaco/álcool',
  recentSurgery: 'Cirurgias recentes',
  medication: 'Medicação',
} as const;

const BODY_LABELS = {
  height: 'Altura',
  bodyWeight: 'Peso corporal',
  bodyFat: '% Massa gorda',
  leanMass: '% Massa magra',
  bmi: 'IMC',
  metabolicAge: 'Idade metabólica',
  basalMetabolism: 'Metabolismo basal',
  waterPercent: '% Água',
  visceralFat: 'Gordura visceral',
  bloodPressure: 'Pressão arterial',
} as const;

const PERIMETER_LABELS = {
  shoulder: 'Ombro',
  bicep: 'Bíceps',
  chest: 'Peitoral',
  waist: 'Cintura',
  hip: 'Anca',
  glute: 'Glúteo',
  thigh: 'Coxa',
} as const;

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

