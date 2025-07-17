import React from "react";
import Chart from "react-apexcharts";

export default function LineChart({ chartData, chartOptions }) {
  return (
    <Chart
      options={chartOptions}
      series={chartData.series}
      type="line"
      height={chartOptions.chart?.height || 300}
    />
  );
}
