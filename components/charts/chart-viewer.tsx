"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  LineChart,
  PieChart,
  Scale3D as Scatter3D,
  Download,
  Settings,
  Palette,
  RotateCcw,
  Eye,
  Table,
} from "lucide-react"
import { ImageIcon } from "lucide-react"

// Chart components
import { Chart2D } from "./chart-2d"
import { Chart3D } from "./chart-3d"
import { DataPreview } from "./data-preview"

import { exportToCSV, exportToExcel, exportChartAsPNG, exportChartAsPDF, exportSummaryReport } from "@/lib/export-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, FileSpreadsheet, BarChart } from "lucide-react"

interface ChartViewerProps {
  data: any[]
}

type ChartType = "bar" | "line" | "pie" | "scatter" | "area" | "bar3d" | "line3d" | "scatter3d"

interface ChartConfig {
  type: ChartType
  xAxis: string
  yAxis: string
  title: string
  color: string
  showGrid: boolean
  showLegend: boolean
  animate: boolean
}

const chartTypes = [
  { id: "bar", name: "Bar Chart", icon: BarChart3, category: "2D" },
  { id: "line", name: "Line Chart", icon: LineChart, category: "2D" },
  { id: "pie", name: "Pie Chart", icon: PieChart, category: "2D" },
  { id: "scatter", name: "Scatter Plot", icon: Scatter3D, category: "2D" },
  { id: "area", name: "Area Chart", icon: LineChart, category: "2D" },
  { id: "bar3d", name: "3D Bar Chart", icon: BarChart3, category: "3D" },
  { id: "line3d", name: "3D Line Chart", icon: LineChart, category: "3D" },
  { id: "scatter3d", name: "3D Scatter Plot", icon: Scatter3D, category: "3D" },
]

const colorOptions = [
  { name: "Primary", value: "hsl(var(--chart-1))" },
  { name: "Secondary", value: "hsl(var(--chart-2))" },
  { name: "Accent", value: "hsl(var(--chart-3))" },
  { name: "Success", value: "hsl(var(--chart-4))" },
  { name: "Warning", value: "hsl(var(--chart-5))" },
]

export function ChartViewer({ data }: ChartViewerProps) {
  const [currentView, setCurrentView] = useState<"charts" | "data">("charts")
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: "bar",
    xAxis: "",
    yAxis: "",
    title: "My Chart",
    color: colorOptions[0].value,
    showGrid: true,
    showLegend: true,
    animate: true,
  })

  // Extract column headers from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  // Filter numeric columns for Y-axis
  const numericColumns = useMemo(() => {
    if (!data || data.length === 0) return []
    return columns.filter((col) => {
      const sample = data.find((row) => row[col] != null)
      return sample && !isNaN(Number(sample[col]))
    })
  }, [data, columns])

  // Filter categorical columns for X-axis
  const categoricalColumns = useMemo(() => {
    if (!data || data.length === 0) return []
    return columns.filter((col) => {
      const sample = data.find((row) => row[col] != null)
      return sample && (isNaN(Number(sample[col])) || typeof sample[col] === "string")
    })
  }, [data, columns])

  // Set default axes when data changes
  useMemo(() => {
    if (categoricalColumns.length > 0 && !chartConfig.xAxis) {
      setChartConfig((prev) => ({ ...prev, xAxis: categoricalColumns[0] }))
    }
    if (numericColumns.length > 0 && !chartConfig.yAxis) {
      setChartConfig((prev) => ({ ...prev, yAxis: numericColumns[0] }))
    }
  }, [categoricalColumns, numericColumns, chartConfig.xAxis, chartConfig.yAxis])

  const handleChartTypeChange = (type: ChartType) => {
    setChartConfig((prev) => ({ ...prev, type }))
  }

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setChartConfig((prev) => ({ ...prev, [key]: value }))
  }

  const resetConfig = () => {
    setChartConfig({
      type: "bar",
      xAxis: categoricalColumns[0] || "",
      yAxis: numericColumns[0] || "",
      title: "My Chart",
      color: colorOptions[0].value,
      showGrid: true,
      showLegend: true,
      animate: true,
    })
  }

  const selectedChartType = chartTypes.find((ct) => ct.id === chartConfig.type)
  const is3D = selectedChartType?.category === "3D"

  const handleExport = (type: "png" | "pdf" | "csv" | "excel" | "report") => {
    const filename = `${chartConfig.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}`

    switch (type) {
      case "png":
        if (chartRef.current) {
          exportChartAsPNG(chartRef.current.id, filename)
        }
        break
      case "pdf":
        if (chartRef.current) {
          exportChartAsPDF(chartRef.current.id, filename)
        }
        break
      case "csv":
        exportToCSV(data, filename)
        break
      case "excel":
        exportToExcel(data, filename)
        break
      case "report":
        exportSummaryReport(data, chartConfig, filename)
        break
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-balance">Chart Generation</h2>
          <p className="text-muted-foreground text-pretty">
            Upload Excel data to start creating beautiful visualizations
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Upload an Excel file to start generating charts and visualizations
            </p>
            <Button onClick={() => window.location.reload()}>Upload Data</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-balance">Chart Generation</h2>
          <p className="text-muted-foreground text-pretty">
            Create interactive 2D and 3D visualizations from your Excel data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetConfig}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Data as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Data as Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("report")}>
                <BarChart className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "charts" | "data")}>
        <TabsList>
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="data">
            <Table className="h-4 w-4 mr-2" />
            Data Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Configuration Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Chart Settings
                </CardTitle>
                <CardDescription>Customize your visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chart Type Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Chart Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {chartTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <Button
                          key={type.id}
                          variant={chartConfig.type === type.id ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          onClick={() => handleChartTypeChange(type.id as ChartType)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {type.name}
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {type.category}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Axis Configuration */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Data Mapping</Label>

                  {chartConfig.type !== "pie" && (
                    <div className="space-y-2">
                      <Label htmlFor="x-axis" className="text-xs">
                        X-Axis (Categories)
                      </Label>
                      <Select value={chartConfig.xAxis} onValueChange={(value) => handleConfigChange("xAxis", value)}>
                        <SelectTrigger id="x-axis">
                          <SelectValue placeholder="Select X-axis" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoricalColumns.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="y-axis" className="text-xs">
                      {chartConfig.type === "pie" ? "Values" : "Y-Axis (Values)"}
                    </Label>
                    <Select value={chartConfig.yAxis} onValueChange={(value) => handleConfigChange("yAxis", value)}>
                      <SelectTrigger id="y-axis">
                        <SelectValue placeholder="Select Y-axis" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Styling Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Styling
                  </Label>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs">
                      Chart Title
                    </Label>
                    <Input
                      id="title"
                      value={chartConfig.title}
                      onChange={(e) => handleConfigChange("title", e.target.value)}
                      placeholder="Enter chart title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-xs">
                      Color Scheme
                    </Label>
                    <Select value={chartConfig.color} onValueChange={(value) => handleConfigChange("color", value)}>
                      <SelectTrigger id="color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show Grid</Label>
                      <Button
                        variant={chartConfig.showGrid ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConfigChange("showGrid", !chartConfig.showGrid)}
                      >
                        {chartConfig.showGrid ? "On" : "Off"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show Legend</Label>
                      <Button
                        variant={chartConfig.showLegend ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConfigChange("showLegend", !chartConfig.showLegend)}
                      >
                        {chartConfig.showLegend ? "On" : "Off"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Animation</Label>
                      <Button
                        variant={chartConfig.animate ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConfigChange("animate", !chartConfig.animate)}
                      >
                        {chartConfig.animate ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Display */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {chartConfig.title}
                </CardTitle>
                <CardDescription>
                  {selectedChartType?.name} • {data.length} data points
                  {chartConfig.xAxis && chartConfig.yAxis && (
                    <>
                      {" "}
                      • {chartConfig.xAxis} vs {chartConfig.yAxis}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartConfig.xAxis && chartConfig.yAxis ? (
                  <div ref={chartRef} id="chart-container" className="h-[500px]">
                    {is3D ? <Chart3D data={data} config={chartConfig} /> : <Chart2D data={data} config={chartConfig} />}
                  </div>
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select X and Y axes to generate chart</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <DataPreview data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
