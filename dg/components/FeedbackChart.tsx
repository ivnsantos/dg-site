'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import FeedbackTimelineChart from './FeedbackTimelineChart'

interface FeedbackStats {
  option: string
  count: number
  percentage: number
}

interface FeedbackResponse {
  id: number
  selectedOption: string
  textResponse: string | null
  clientName: string | null
  clientEmail: string | null
  createdAt: string
}

interface FeedbackChartProps {
  stats: FeedbackStats[]
  totalResponses: number
  responses: FeedbackResponse[]
}

const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3', '#D2691E']

export default function FeedbackChart({ stats, totalResponses, responses }: FeedbackChartProps) {
  if (totalResponses === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma resposta para exibir no gráfico</p>
      </div>
    )
  }

  const chartData = stats.map((stat, index) => ({
    name: stat.option,
    value: stat.count,
    percentage: stat.percentage,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Gráfico de Barras */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gráfico de Barras</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  `${value} respostas (${chartData.find(item => item.value === value)?.percentage}%)`,
                  'Quantidade'
                ]}
                labelStyle={{ color: '#374151' }}
              />
              <Bar 
                dataKey="value" 
                fill="#8B4513"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gráfico de Pizza</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [
                  `${value} respostas`,
                  name
                ]}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico Temporal */}
      <FeedbackTimelineChart responses={responses} />

      {/* Resumo Estatístico */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Estatístico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total de Respostas</p>
            <p className="text-2xl font-bold text-blue-900">{totalResponses}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Opção Mais Votada</p>
            <p className="text-lg font-semibold text-green-900">
              {stats.length > 0 ? stats[0].option : 'N/A'}
            </p>
            <p className="text-sm text-green-600">
              {stats.length > 0 ? `${stats[0].count} votos (${stats[0].percentage}%)` : ''}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Opções Disponíveis</p>
            <p className="text-2xl font-bold text-purple-900">{stats.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 