// src/components/ProgressChart.jsx
import React from "react";
import LineChart from "components/charts/LineChart";
import {
  lineChartDataOverallRevenue,
  lineChartOptionsOverallRevenue,
} from "variables/charts";

export default function ProgressChart({ data, options }) {
  const chartData = { series: data } || lineChartDataOverallRevenue;
  const chartOptions = options || lineChartOptionsOverallRevenue;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Progresso Semanal</h2>
      <LineChart chartData={chartData} chartOptions={chartOptions} />
    </div>
  );
}
