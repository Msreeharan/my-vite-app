"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileSpreadsheet, Download, Eye, Trash2, Search, Calendar, Filter } from "lucide-react"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UploadRecord {
  id: string
  fileName: string
  uploadDate: Date
  fileSize: number
  rowCount: number
  columnCount: number
  status: "success" | "processing" | "error"
  chartsCreated: number
  lastAccessed: Date
}

// Mock data for demonstration
const mockUploads: UploadRecord[] = [
  {
    id: "1",
    fileName: "sales-data-2024.xlsx",
    uploadDate: new Date("2024-01-15T10:30:00"),
    fileSize: 2048576,
    rowCount: 1250,
    columnCount: 8,
    status: "success",
    chartsCreated: 3,
    lastAccessed: new Date("2024-01-16T14:20:00"),
  },
  {
    id: "2",
    fileName: "customer-analytics.xlsx",
    uploadDate: new Date("2024-01-14T16:45:00"),
    fileSize: 1536000,
    rowCount: 890,
    columnCount: 12,
    status: "success",
    chartsCreated: 5,
    lastAccessed: new Date("2024-01-15T09:15:00"),
  },
  {
    id: "3",
    fileName: "inventory-report.xlsx",
    uploadDate: new Date("2024-01-13T11:20:00"),
    fileSize: 3072000,
    rowCount: 2100,
    columnCount: 6,
    status: "success",
    chartsCreated: 2,
    lastAccessed: new Date("2024-01-14T13:30:00"),
  },
  {
    id: "4",
    fileName: "financial-data.xlsx",
    uploadDate: new Date("2024-01-12T09:15:00"),
    fileSize: 512000,
    rowCount: 450,
    columnCount: 10,
    status: "error",
    chartsCreated: 0,
    lastAccessed: new Date("2024-01-12T09:15:00"),
  },
  {
    id: "5",
    fileName: "marketing-metrics.xlsx",
    uploadDate: new Date("2024-01-11T14:30:00"),
    fileSize: 1024000,
    rowCount: 680,
    columnCount: 15,
    status: "processing",
    chartsCreated: 1,
    lastAccessed: new Date("2024-01-11T15:45:00"),
  },
]

export function UploadHistory() {
  const [uploads, setUploads] = useState<UploadRecord[]>(mockUploads)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredUploads = uploads
    .filter((upload) => {
      const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || upload.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.uploadDate.getTime() - a.uploadDate.getTime()
        case "date-asc":
          return a.uploadDate.getTime() - b.uploadDate.getTime()
        case "name-asc":
          return a.fileName.localeCompare(b.fileName)
        case "name-desc":
          return b.fileName.localeCompare(a.fileName)
        case "size-desc":
          return b.fileSize - a.fileSize
        case "size-asc":
          return a.fileSize - b.fileSize
        default:
          return 0
      }
    })

  const handleDelete = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleExportUpload = (upload: UploadRecord, type: "csv" | "excel") => {
    // Mock data for the upload - in real app this would fetch actual data
    const mockData = Array.from({ length: upload.rowCount }, (_, i) => {
      const row: any = {}
      for (let j = 0; j < upload.columnCount; j++) {
        row[`Column_${j + 1}`] = `Sample_${i + 1}_${j + 1}`
      }
      return row
    })

    const filename = upload.fileName.replace(/\.[^/.]+$/, "")

    switch (type) {
      case "csv":
        exportToCSV(mockData, filename)
        break
      case "excel":
        exportToExcel(mockData, filename)
        break
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-balance">Upload History</h2>
        <p className="text-muted-foreground text-pretty">View and manage your previously uploaded Excel files</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="size-desc">Largest First</SelectItem>
                <SelectItem value="size-asc">Smallest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upload List */}
      <div className="space-y-4">
        {filteredUploads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No uploads found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first Excel file to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUploads.map((upload) => (
            <Card key={upload.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{upload.fileName}</h4>
                        {getStatusBadge(upload.status)}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">Uploaded</p>
                          <p>{formatDate(upload.uploadDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Size</p>
                          <p>{formatFileSize(upload.fileSize)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Data</p>
                          <p>
                            {upload.rowCount.toLocaleString()} rows, {upload.columnCount} cols
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Charts</p>
                          <p>{upload.chartsCreated} created</p>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        Last accessed: {formatDate(upload.lastAccessed)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExportUpload(upload, "csv")}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportUpload(upload, "excel")}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Download as Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(upload.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploads.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {uploads.filter((u) => u.status === "success").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploads.reduce((sum, u) => sum + u.chartsCreated, 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
