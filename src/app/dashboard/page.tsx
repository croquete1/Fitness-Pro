// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { Column } from 'react-table';
import StatsCard from '@/components/dashboard/StatsCard';
import LineChart from '@/components/dashboard/LineChart';
import DataTable from '@/components/dashboard/DataTable';
import RecentActivityList from '@/components/dashboard/RecentActivityList';

interface User {
  name: string;
  email: string;
  createdAt: string;
}

export default function DashboardPage() {
  // Estatísticas
  const stats = [
    { title: 'Novos Utilizadores', value: 154,    colorClass: 'bg-blue-100 text-blue-800' },
    { title: 'Vendas',            value: 87,     colorClass: 'bg-green-100 text-green-800' },
    { title: 'Visitas',           value: '1.2k', colorClass: 'bg-purple-100 text-purple-800' },
  ];

  // Dados do gráfico de linhas
  const chartData = [
    { name: 'Jan', value: 30 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 60 },
  ];

  // Definição de colunas para react-table v7
  const tableColumns: Column<User>[] = [
    {
      Header: 'Nome',
      accessor: 'name',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'Registado em',
      accessor: 'createdAt',
      Cell: ({ value }) => {
        const date = new Date(value as string);
        return date.toLocaleDateString('pt-PT');
      },
    },
  ];

  // Linhas da tabela
  const tableData: User[] = [
    { name: 'Ana',   email: 'ana@example.com',   createdAt: '2025-07-25' },
    { name: 'Bruno', email: 'bruno@example.com', createdAt: '2025-07-26' },
  ];

  // Atividades recentes
  const recentActivities = [
    { id: '1', description: 'Login efetuado',         timestamp: '2025-07-27T10:15:00Z' },
    { id: '2', description: 'Novo registo concluído', timestamp: '2025-07-27T09:50:00Z' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      {/* Gráfico de linhas */}
      <div className="bg-white p-4 rounded shadow">
        <LineChart data={chartData} />
      </div>

      {/* Tabela de dados */}
      <div className="bg-white p-4 rounded shadow">
        <DataTable<User> columns={tableColumns} data={tableData} />
      </div>

      {/* Lista de atividades recentes */}
      <div className="bg-white p-4 rounded shadow">
        <RecentActivityList activities={recentActivities} />
      </div>
    </div>
  );
}
