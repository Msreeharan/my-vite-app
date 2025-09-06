import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Export data to CSV
export const exportToCSV = (data: any[], filename = "data") => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ""
        })
        .join(","),
    ),
  ].join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

// Export data to Excel
export const exportToExcel = (data: any[], filename = "data") => {
  if (!data || data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  const colWidths: number[] = []

  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]
      if (cell && cell.v) {
        const cellLength = String(cell.v).length
        maxWidth = Math.max(maxWidth, cellLength)
      }
    }
    colWidths[C] = Math.min(maxWidth + 2, 50) // Cap at 50 characters
  }

  worksheet["!cols"] = colWidths.map((w) => ({ width: w }))

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Export chart as PNG
export const exportChartAsPNG = async (elementId: string, filename = "chart") => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error("Chart element not found")
    return
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
    })

    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  } catch (error) {
    console.error("Error exporting chart as PNG:", error)
  }
}

// Export chart as PDF
export const exportChartAsPDF = async (elementId: string, filename = "chart") => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error("Chart element not found")
    return
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error("Error exporting chart as PDF:", error)
  }
}

// Export 3D chart as image (special handling for Three.js canvas)
export const export3DChartAsPNG = (canvasElement: HTMLCanvasElement, filename = "3d-chart") => {
  try {
    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = canvasElement.toDataURL("image/png")
    link.click()
  } catch (error) {
    console.error("Error exporting 3D chart:", error)
  }
}

// Utility function to download files
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Generate summary report
export const exportSummaryReport = (data: any[], chartConfig: any, filename = "report") => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const numericColumns = headers.filter((col) => {
    const sample = data.find((row) => row[col] != null)
    return sample && !isNaN(Number(sample[col]))
  })

  // Calculate basic statistics
  const stats = numericColumns.map((col) => {
    const values = data.map((row) => Number(row[col])).filter((val) => !isNaN(val))
    const sum = values.reduce((a, b) => a + b, 0)
    const mean = sum / values.length
    const sortedValues = values.sort((a, b) => a - b)
    const median =
      sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)]

    return {
      column: col,
      count: values.length,
      sum: sum.toFixed(2),
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
    }
  })

  // Create report content
  const reportContent = [
    "DATA ANALYSIS REPORT",
    "=".repeat(50),
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Dataset: ${data.length} rows, ${headers.length} columns`,
    `Chart Type: ${chartConfig.type}`,
    `X-Axis: ${chartConfig.xAxis}`,
    `Y-Axis: ${chartConfig.yAxis}`,
    "",
    "COLUMN STATISTICS",
    "-".repeat(30),
    "",
    ...stats.map((stat) =>
      [
        `Column: ${stat.column}`,
        `  Count: ${stat.count}`,
        `  Sum: ${stat.sum}`,
        `  Mean: ${stat.mean}`,
        `  Median: ${stat.median}`,
        `  Min: ${stat.min}`,
        `  Max: ${stat.max}`,
        "",
      ].join("\n"),
    ),
    "",
    "RAW DATA PREVIEW (First 10 rows)",
    "-".repeat(40),
    "",
    headers.join("\t"),
    ...data.slice(0, 10).map((row) => headers.map((header) => row[header] ?? "").join("\t")),
  ].join("\n")

  downloadFile(reportContent, `${filename}.txt`, "text/plain")
}
