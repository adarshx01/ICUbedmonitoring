import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts'
const Piechart = () => {
    const icuUsageData = [
        { name: 'Occupied', value: 75 },
        { name: 'Available', value: 25 },
      ]
    
      const costSavingsData = [
        { name: 'Traditional ICU', cost: 10000 },
        { name: 'CriticalLink ICU', cost: 1000 },
      ]
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
  return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={icuUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                >
                {icuUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
  )
}

export default Piechart