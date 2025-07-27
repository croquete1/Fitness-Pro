// src/app/dashboard/page.tsx
'use client';
import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import LineChart from '@/components/dashboard/LineChart';
import DataTable from '@/components/dashboard/DataTable';
import RecentActivityList from '@/components/dashboard/RecentActivityList';

export default function DashboardPage() {
  // Dados de exemplo  
  const stats = [
    { title: 'Novos Utilizadores', value: 154, colorClass: 'bg-blue-100 text-blue-800' },
    { title: 'Vendas', value: 87, colorClass: 'bg-green-100 text-green-800' },
    { title: 'Visitas', value: '1.2k', colorClass: 'bg-purple-100 text-purple-800' },
  ];

  const chartData = [
    { name: 'Jan', value: 30 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 60 },
  ];

  const tableColumns = [
    { Header: 'Nome', accessor: 'name' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Registado em', accessor: 'createdAt' },
  ];
  const tableData = [
    { name: 'Ana', email: 'ana@example.com', createdAt: '2025-07-25' },
    { name: 'Bruno', email: 'bruno@example.com', createdAt: '2025-07-26' },
  ];

  const recentActivities = [
    { id: '1', description: 'Login efetuado', timestamp: '2025-07-27T10:15:00Z' },
    { id: '2', description: 'Novo registo concluído', timestamp: '2025-07-27T09:50:00Z' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Gráfico de linhas */}
      <div className="bg-white p-4 rounded shadow">
        <LineChart data={chartData} />
      </div>

      {/* Tabela de dados */}
      <div className="bg-white p-4 rounded shadow">
        <DataTable columns={tableColumns} data={tableData} />
      </div>

      {/* Lista de atividades recentes */}
      <div className="bg-white p-4 rounded shadow">
        <RecentActivityList activities={recentActivities} />
      </div>
    </div>
  );
}
