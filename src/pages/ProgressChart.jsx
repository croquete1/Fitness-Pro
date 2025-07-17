import React from "react";
import Chart from "react-apexcharts";
import Card from "@horizon-ui/react-tailwind/components/card"; // ou caminho correto

export default function ProgressChart({ data }) {
  const categories = data.map(item => item.date);
  const series = [{ name: "Peso (kg)", data: data.map(item => item.weight) }];
  
  const options = {
    chart: { toolbar: { show: false } },
    xaxis: { categories },
    theme: { mode: 'light' },
  };

  return (
    <Card extra="p-5 w-full bg-white shadow-md">
      <Chart options={options} series={series} type="line" height={300} />
    </Card>
  );
}
