// src/app/(app)/dashboard/clients/metrics/metricsClient.tsx
"use client";

import * as React from "react";

type Row = {
  id: string;
  measured_at: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  bmi: number | null;
  notes?: string | null;
};

const historyDateFormatter = new Intl.DateTimeFormat("pt-PT");

function formatHistoryDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return historyDateFormatter.format(date);
}

function calcBMI(weight: number | null | undefined, height: number | null | undefined) {
  if (!weight || !height) return null;
  const meters = height / 100;
  if (!meters) return null;
  return Number((weight / (meters * meters)).toFixed(1));
}

function parseDateLike(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const iso = new Date(raw);
    if (!Number.isNaN(iso.getTime())) return iso.toISOString();
  }
  const ddmmyyyy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]) - 1;
    const year = Number(ddmmyyyy[3].length === 2 ? `20${ddmmyyyy[3]}` : ddmmyyyy[3]);
    const date = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return null;
}

function parseNumberLike(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

function formatMetric(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

export default function MetricsClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [form, setForm] = React.useState({
    date: new Date().toISOString().substring(0, 10),
    weight: "",
    height: "",
    fat: "",
    notes: "",
  });
  const [importing, setImporting] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const summary = React.useMemo(() => {
    if (!rows.length) return null;
    const latest = rows[0];
    const previous = rows.find((_, idx) => idx > 0 && rows[idx]?.weight_kg != null && rows[idx]?.measured_at);
    const weights = rows
      .map((row) => row.weight_kg)
      .filter((value): value is number => typeof value === "number");
    const avgWeight = weights.length
      ? Number((weights.reduce((acc, value) => acc + value, 0) / weights.length).toFixed(1))
      : null;
    const trendWeight =
      latest.weight_kg != null && previous?.weight_kg != null
        ? Number((latest.weight_kg - previous.weight_kg).toFixed(1))
        : null;

    return { latest, avgWeight, trendWeight };
  }, [rows]);

  async function add() {
    const weight = parseNumberLike(form.weight);
    const height = parseNumberLike(form.height);
    const fat = parseNumberLike(form.fat);
    const payload = {
      measured_at: form.date,
      weight_kg: weight,
      height_cm: height,
      body_fat_pct: fat,
      bmi: calcBMI(weight, height),
      notes: form.notes || null,
    };

    const response = await fetch("/api/clients/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => null);

    if (response.ok && json?.row) {
      setRows((current) => [json.row as Row, ...current]);
      setForm({
        date: new Date().toISOString().substring(0, 10),
        weight: "",
        height: "",
        fat: "",
        notes: "",
      });
      return;
    }

    window.alert(json?.message ?? "Não foi possível guardar as métricas.");
  }

  async function generateReport() {
    if (!rows.length) {
      window.alert("Adicione pelo menos uma avaliação para gerar o relatório.");
      return;
    }

    setGenerating(true);
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableModule as { default?: (doc: any, options: any) => void }).default ??
        (autoTableModule as unknown as (doc: any, options: any) => void);
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const latest = rows[0];
      const createdAt = latest.measured_at ? new Date(latest.measured_at) : new Date();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Análise da composição corporal", 105, 18, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Emitido em: ${new Date().toLocaleString("pt-PT")}`, 20, 28);
      doc.text(`Última avaliação: ${createdAt.toLocaleDateString("pt-PT")}`, 20, 34);

      const summaryY = 42;
      const latestLines = [
        `Peso: ${latest.weight_kg ?? "—"} kg`,
        `Altura: ${latest.height_cm ?? "—"} cm`,
        `% Massa gorda: ${latest.body_fat_pct ?? "—"} %`,
        `IMC: ${latest.bmi ?? calcBMI(latest.weight_kg, latest.height_cm) ?? "—"}`,
      ];
      doc.text("Resumo da última avaliação", 20, summaryY, { baseline: "top" });
      latestLines.forEach((line, index) => doc.text(line, 20, summaryY + 6 + index * 6));

      if (summary) {
        const startX = 120;
        doc.text("Tendência", startX, summaryY, { baseline: "top" });
        const avgText = summary.avgWeight
          ? `Peso médio (últimos ${rows.length} registos): ${summary.avgWeight} kg`
          : "Peso médio indisponível";
        doc.text(avgText, startX, summaryY + 6);
        const trendText =
          summary.trendWeight != null
            ? `Variação desde a avaliação anterior: ${summary.trendWeight > 0 ? "+" : ""}${summary.trendWeight} kg`
            : "Sem avaliação anterior para comparar";
        doc.text(trendText, startX, summaryY + 12);
      }

      autoTable(doc, {
        startY: summaryY + 32,
        head: [["Data", "Peso (kg)", "Altura (cm)", "% Gordura", "IMC", "Notas"]],
        body: rows.slice(0, 20).map((row) => [
          row.measured_at ? new Date(row.measured_at).toLocaleDateString("pt-PT") : "—",
          row.weight_kg ?? "—",
          row.height_cm ?? "—",
          row.body_fat_pct ?? "—",
          row.bmi ?? calcBMI(row.weight_kg, row.height_cm) ?? "—",
          row.notes ?? "",
        ]),
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
      });

      doc.save(`avaliacao-${createdAt.toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível gerar o relatório. Tenta novamente.");
    } finally {
      setGenerating(false);
    }
  }

  async function onImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const Papa = (await import("papaparse")).default;
      const text = await file.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      }) as unknown as {
        data: Array<Record<string, unknown>>;
        errors: Array<{ message: string }>;
      };

      if (parsed.errors.length) {
        throw new Error(parsed.errors[0].message);
      }

      const mapped = (parsed.data || [])
        .map((row) => {
          const measured_at = parseDateLike(row["data"] ?? row["date"] ?? row["measured_at"]);
          const weight_kg = parseNumberLike(row["peso"] ?? row["weight"] ?? row["weight_kg"]);
          const height_cm = parseNumberLike(row["altura"] ?? row["height"] ?? row["height_cm"]);
          const body_fat_pct = parseNumberLike(
            row["percentual_gordura"] ?? row["bodyfat"] ?? row["body_fat_pct"] ?? row["%gordura"],
          );
          const bmi = parseNumberLike(row["imc"] ?? row["bmi"]) ?? calcBMI(weight_kg, height_cm);
          const notes =
            typeof row["notas"] === "string"
              ? row["notas"]
              : typeof row["notes"] === "string"
              ? row["notes"]
              : null;

          if (!measured_at && weight_kg == null && height_cm == null && body_fat_pct == null && bmi == null && !notes) {
            return null;
          }

          return { measured_at, weight_kg, height_cm, body_fat_pct, bmi, notes };
        })
        .filter((row): row is {
          measured_at: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          body_fat_pct: number | null;
          bmi: number | null;
          notes: string | null;
        } => Boolean(row));

      if (!mapped.length) {
        window.alert("Não foram encontrados registos válidos no ficheiro.");
        return;
      }

      const response = await fetch("/api/clients/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mapped }),
      });
      const json = await response.json().catch(() => null);

      if (response.ok && Array.isArray(json?.rows)) {
        setRows((current) => [...(json.rows as Row[]), ...current]);
      } else {
        window.alert(json?.message ?? "Não foi possível importar os dados.");
      }
    } catch (error) {
      console.error(error);
      window.alert("Erro ao processar o ficheiro da balança. Confirme o formato e tente novamente.");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  const trendVariant = summary?.trendWeight != null
    ? summary.trendWeight < 0
      ? "success"
      : summary.trendWeight > 0
      ? "warning"
      : undefined
    : undefined;

  return (
    <div className="client-metrics">
      <section className="neo-panel client-metrics__panel" aria-labelledby="metrics-form-heading">
        <header className="neo-panel__header client-metrics__header">
          <div className="neo-panel__meta">
            <h1 id="metrics-form-heading" className="neo-panel__title">
              Métricas antropométricas
            </h1>
            <p className="neo-panel__subtitle">Regista novas avaliações e acompanha a evolução.</p>
          </div>
          <div className="client-metrics__cta">
            <button
              type="button"
              className="btn ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "A importar…" : "Importar CSV"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={generateReport}
              disabled={!rows.length || generating}
            >
              {generating ? "A gerar…" : "Exportar PDF"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={onImportFile}
              className="sr-only"
            />
          </div>
        </header>

        <div className="client-metrics__formGrid" role="group" aria-labelledby="metrics-form-heading">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Data</span>
            <input
              type="date"
              className="neo-input"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Peso (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              className="neo-input"
              value={form.weight}
              onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
            />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Altura (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              className="neo-input"
              value={form.height}
              onChange={(event) => setForm((current) => ({ ...current, height: event.target.value }))}
            />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">% Massa gorda</span>
            <input
              type="number"
              inputMode="decimal"
              className="neo-input"
              value={form.fat}
              onChange={(event) => setForm((current) => ({ ...current, fat: event.target.value }))}
            />
          </label>
          <label className="neo-input-group__field client-metrics__notesField">
            <span className="neo-input-group__label">Notas</span>
            <textarea
              className="neo-input neo-input--textarea"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
            />
          </label>
        </div>

        <div className="client-metrics__submit">
          <button type="button" className="btn primary" onClick={add}>
            Adicionar registo
          </button>
        </div>
      </section>

      {summary && (
        <section className="neo-panel client-metrics__panel" aria-live="polite">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Resumo rápido</h2>
            <p className="neo-panel__subtitle">Última avaliação e tendência recente.</p>
          </div>
          <div className="client-metrics__summaryGrid">
            <div className="neo-surface client-metrics__summaryCard">
              <span className="neo-surface__hint">Último peso</span>
              <p className="client-metrics__summaryValue">{formatMetric(summary.latest.weight_kg, " kg")}</p>
            </div>
            <div className="neo-surface client-metrics__summaryCard">
              <span className="neo-surface__hint">Peso médio</span>
              <p className="client-metrics__summaryValue">{formatMetric(summary.avgWeight, " kg")}</p>
            </div>
            <div className="neo-surface client-metrics__summaryCard" data-variant={trendVariant}>
              <span className="neo-surface__hint">Variação</span>
              <p className="client-metrics__summaryValue">
                {summary.trendWeight != null ? `${summary.trendWeight > 0 ? "+" : ""}${summary.trendWeight} kg` : "—"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="neo-panel client-metrics__panel" aria-labelledby="metrics-history-heading">
        <header className="neo-panel__header client-metrics__header">
          <div className="neo-panel__meta">
            <h2 id="metrics-history-heading" className="neo-panel__title">
              Histórico de avaliações
            </h2>
            <p className="neo-panel__subtitle">Ordenado da mais recente para a mais antiga.</p>
          </div>
          <span className="client-metrics__count">{rows.length} registo(s)</span>
        </header>

        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>Altura</th>
                <th>% Gordura</th>
                <th>IMC</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const bmiValue = row.bmi ?? calcBMI(row.weight_kg, row.height_cm) ?? "—";
                return (
                  <tr key={row.id}>
                    <td>{formatHistoryDate(row.measured_at)}</td>
                    <td>{formatMetric(row.weight_kg, " kg")}</td>
                    <td>{formatMetric(row.height_cm, " cm")}</td>
                    <td>{formatMetric(row.body_fat_pct, "%")}</td>
                    <td>{formatMetric(typeof bmiValue === "number" ? bmiValue : null)}</td>
                    <td className="client-metrics__note">{row.notes ?? ""}</td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📉
                      </span>
                      <p className="neo-empty__title">Sem registos ainda</p>
                      <p className="neo-empty__description">
                        Adiciona medições para acompanhares a evolução com o teu PT.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
