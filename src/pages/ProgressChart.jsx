import React from "react";
import LineChart from "../components/charts/LineChart";
import {
  defaultLineChart,
  defaultLineChartOptions,
} from "../variables/charts";


export default function ProgressChart({ data, options }) {
  const chartData = data ? { series: data } : defaultLineChart;
  const chartOptions = options || defaultLineChartOptions;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Progresso Semanal</h2>
      <LineChart chartData={chartData} chartOptions={chartOptions} />
    </div>
  );
}
