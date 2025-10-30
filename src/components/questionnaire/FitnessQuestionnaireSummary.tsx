// src/components/questionnaire/FitnessQuestionnaireSummary.tsx
import type { QuestionnaireNormalized } from '@/lib/questionnaire';
import { QUESTIONNAIRE_WEEKDAY_LABEL } from '@/lib/questionnaire';

type Props = {
  data: QuestionnaireNormalized;
  variant?: 'full' | 'compact';
};

export default function FitnessQuestionnaireSummary({ data, variant = 'full' }: Props) {
  const dayLabels = data.schedule.days
    .map((day) => QUESTIONNAIRE_WEEKDAY_LABEL[day] ?? day)
    .filter((label): label is string => Boolean(label));
  const hasDays = dayLabels.length > 0;
  const days = hasDays ? formatDays(dayLabels) : '';
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
            <dd>{renderValue(data.job)}</dd>
          </div>
          <div>
            <dt>Actividade diária</dt>
            <dd>{data.activity}</dd>
          </div>
          <div>
            <dt>Objectivo</dt>
            <dd>{renderValue(data.objective)}</dd>
          </div>
          <div>
            <dt>Bem-estar (0-5)</dt>
            <dd>{renderValue(data.wellbeing)}</dd>
          </div>
        </dl>
      </section>

      <section className="questionnaire-summary__section">
        <h4>Prática de exercício</h4>
        <dl>
          <div>
            <dt>Pratica actividade física?</dt>
            <dd>{data.exercise.practice ? 'Sim' : 'Não'}</dd>
          </div>
          <div>
            <dt>Modalidade</dt>
            <dd>{renderValue(data.exercise.sport)}</dd>
          </div>
          <div>
            <dt>Frequência/Duração</dt>
            <dd>{renderValue(data.exercise.duration)}</dd>
          </div>
        </dl>
      </section>

      <section className="questionnaire-summary__section">
        <h4>Anamnese</h4>
        <dl>
          {ANAMNESIS_FIELDS.map((key) => (
            <div key={key}>
              <dt>{ANAMNESIS_LABELS[key]}</dt>
              <dd>{renderValue(data.anamnesis[key])}</dd>
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
            {BODY_FIELDS.map((key) => {
              const value = data.metrics.body[key];
              return (
                <div key={key}>
                  <dt>{BODY_LABELS[key]}</dt>
                  <dd>{renderValue(value)}</dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div>
          <h4>Perímetros</h4>
          <dl>
            {PERIMETER_FIELDS.map((key) => {
              const value = data.metrics.perimeters[key];
              return (
                <div key={key}>
                  <dt>{PERIMETER_LABELS[key]}</dt>
                  <dd>{renderValue(value)}</dd>
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
          {data.metrics.observations ? (
            <p className="questionnaire-summary__notes">{data.metrics.observations}</p>
          ) : null}
        </section>
      )}
    </div>
  );
}

const LIST_FORMATTER = new Intl.ListFormat('pt-PT', { style: 'long', type: 'conjunction' });
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

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

const ANAMNESIS_FIELDS = Object.keys(ANAMNESIS_LABELS) as (keyof typeof ANAMNESIS_LABELS)[];
const BODY_FIELDS = Object.keys(BODY_LABELS) as (keyof typeof BODY_LABELS)[];
const PERIMETER_FIELDS = Object.keys(PERIMETER_LABELS) as (keyof typeof PERIMETER_LABELS)[];

function formatDays(labels: string[]): string {
  try {
    return LIST_FORMATTER.format(labels);
  } catch {
    return labels.join(', ');
  }
}

function formatDate(iso: string) {
  try {
    return DATE_TIME_FORMATTER.format(new Date(iso));
  } catch {
    return '—';
  }
}

function renderValue(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : '—';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '—';
  }
  if (value == null) return '—';
  return String(value);
}

