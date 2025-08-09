"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export function UsersLineChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <div className="h-64 w-full rounded-xl border p-3">
      <div className="text-sm text-gray-500 mb-2">Evolução de utilizadores</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RolesBarChart({
  data,
}: {
  data: { role: string; count: number }[];
}) {
  return (
    <div className="h-64 w-full rounded-xl border p-3">
      <div className="text-sm text-gray-500 mb-2">Distribuição por papel</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="role" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
