export const defaultLineChart = {
  series: [
    { name: "Progresso", data: [0, 0, 0, 0, 0, 0, 0] }
  ],
};

export const defaultLineChartOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  xaxis: { categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] },
  stroke: { curve: "smooth" },
  dataLabels: { enabled: false },
  legend: { position: "top" },
};
