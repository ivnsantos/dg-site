'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface FeedbackResponse {
  id: number
  selectedOption: string
  textResponse: string | null
  clientName: string | null
  clientEmail: string | null
  createdAt: string
}

interface FeedbackTimelineChartProps {
  responses: FeedbackResponse[]
}

export default function FeedbackTimelineChart({ responses }: FeedbackTimelineChartProps) {
  if (responses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma resposta para exibir no gráfico temporal</p>
      </div>
    )
  }

  // Agrupar respostas por data
  const responsesByDate = responses.reduce((acc, response) => {
    const date = new Date(response.createdAt).toLocaleDateString('pt-BR')
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date]++
    return acc
  }, {} as { [key: string]: number })

  // Converter para formato do gráfico
  const chartData = Object.entries(responsesByDate)
    .map(([date, count]) => ({
      date,
      responses: count
    }))
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução das Respostas</h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value: any) => [`${value} respostas`, 'Quantidade']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="responses" 
              stroke="#8B4513" 
              strokeWidth={3}
              dot={{ fill: '#8B4513', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B4513', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Total de dias com respostas: {chartData.length}</p>
        <p>Dia com mais respostas: {chartData.reduce((max, item) => item.responses > max.responses ? item : max, chartData[0])?.date} ({chartData.reduce((max, item) => item.responses > max.responses ? item : max, chartData[0])?.responses} respostas)</p>
      </div>
    </div>
  )
} 