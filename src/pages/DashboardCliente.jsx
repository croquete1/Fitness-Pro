import React from "react";
import ProgressChart from "../components/ProgressChart";

export default function DashboardCliente() {
  // Exemplo com dados reais ou fictícios:
  const weeklyData = {
    series: [{ name: "Progresso", data: [5, 7, 3, 8, 6, 9, 4] }]
  };

  const weeklyOptions = {
    chart: { height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    legend: { position: "top" },
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProgressChart data={weeklyData.series} options={weeklyOptions} />
      </div>
    </div>
  );
}
