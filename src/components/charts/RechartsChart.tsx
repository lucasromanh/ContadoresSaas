import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const sample = [
  { month: 'Ene', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 500 },
  { month: 'Abr', value: 200 }
]

export const RechartsChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={sample}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
