"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Chart2DProps {
  data: any[]
  config: {
    type: string
    xAxis: string
    yAxis: string
    title: string
    color: string
    showGrid: boolean
    showLegend: boolean
    animate: boolean
  }
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function Chart2D({ data, config }: Chart2DProps) {
  const { type, xAxis, yAxis, color, showGrid, showLegend, animate } = config

  // Process data for charts
  const processedData = data.map((item) => ({
    ...item,
    [xAxis]: String(item[xAxis]),
    [yAxis]: Number(item[yAxis]) || 0,
  }))

  // Common chart props
  const commonProps = {
    data: processedData,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey={yAxis} fill={color} animationDuration={animate ? 1000 : 0} />
          </BarChart>
        )

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yAxis}
              stroke={color}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
          </LineChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yAxis}
              stroke={color}
              fill={color}
              fillOpacity={0.6}
              animationDuration={animate ? 1000 : 0}
            />
          </AreaChart>
        )

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis dataKey={yAxis} />
            <Tooltip />
            {showLegend && <Legend />}
            <Scatter dataKey={yAxis} fill={color} animationDuration={animate ? 1000 : 0} />
          </ScatterChart>
        )

      case "pie":
        return (
          <PieChart {...commonProps}>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill={color}
              dataKey={yAxis}
              nameKey={xAxis}
              animationDuration={animate ? 1000 : 0}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Chart type not supported</p>
          </div>
        )
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  )
}
