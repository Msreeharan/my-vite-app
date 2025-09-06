"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (data: any[], headers: string[], fileName: string) => void
}

interface ParsedFile {
  name: string
  size: number
  data: any[]
  headers: string[]
  rowCount: number
  status: "parsing" | "success" | "error"
  error?: string
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [files, setFiles] = useState<ParsedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const parseExcelFile = useCallback(async (file: File): Promise<ParsedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length === 0) {
            resolve({
              name: file.name,
              size: file.size,
              data: [],
              headers: [],
              rowCount: 0,
              status: "error",
              error: "File appears to be empty",
            })
            return
          }

          // Extract headers (first row) and data (remaining rows)
          const headers = jsonData[0] as string[]
          const dataRows = jsonData
            .slice(1)
            .filter(
              (row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && cell !== ""),
            )

          // Convert rows to objects with headers as keys
          const processedData = dataRows.map((row) => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header || `Column ${index + 1}`] = row[index] || null
            })
            return obj
          })

          resolve({
            name: file.name,
            size: file.size,
            data: processedData,
            headers: headers.map((h) => h || "Unnamed Column"),
            rowCount: processedData.length,
            status: "success",
          })
        } catch (error) {
          resolve({
            name: file.name,
            size: file.size,
            data: [],
            headers: [],
            rowCount: 0,
            status: "error",
            error: error instanceof Error ? error.message : "Failed to parse file",
          })
        }
      }

      reader.onerror = () => {
        resolve({
          name: file.name,
          size: file.size,
          data: [],
          headers: [],
          rowCount: 0,
          status: "error",
          error: "Failed to read file",
        })
      }

      reader.readAsArrayBuffer(file)
    })
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true)

      // Filter for Excel files only
      const excelFiles = acceptedFiles.filter(
        (file) =>
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel" ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls"),
      )

      if (excelFiles.length === 0) {
        setFiles((prev) => [
          ...prev,
          {
            name: "Invalid file type",
            size: 0,
            data: [],
            headers: [],
            rowCount: 0,
            status: "error",
            error: "Please upload Excel files (.xlsx or .xls) only",
          },
        ])
        setIsUploading(false)
        return
      }

      // Add files with parsing status
      const newFiles: ParsedFile[] = excelFiles.map((file) => ({
        name: file.name,
        size: file.size,
        data: [],
        headers: [],
        rowCount: 0,
        status: "parsing" as const,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Parse files one by one
      for (let i = 0; i < excelFiles.length; i++) {
        const file = excelFiles[i]
        const parsedFile = await parseExcelFile(file)

        setFiles((prev) => prev.map((f) => (f.name === file.name && f.status === "parsing" ? parsedFile : f)))
      }

      setIsUploading(false)
    },
    [parseExcelFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: true,
  })

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Use hook at top level
  const useFileData = useCallback(
    (file: ParsedFile) => {
      if (file.status === "success") {
        onFileUpload(file.data, file.headers, file.name)
      }
    },
    [onFileUpload],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-balance">Upload Excel Files</h2>
        <p className="text-muted-foreground text-pretty">
          Upload your Excel files (.xlsx or .xls) to start creating beautiful visualizations
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              {isDragActive ? (
                <div>
                  <h3 className="text-lg font-semibold">Drop your Excel files here</h3>
                  <p className="text-muted-foreground">Release to upload</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">Drag & drop Excel files here</h3>
                  <p className="text-muted-foreground">or click to browse files</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Browse Files
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">.xlsx</Badge>
                <Badge variant="secondary">.xls</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span className="text-sm">Processing files...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>

          {files.map((file, index) => (
            <Card key={`${file.name}-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        {file.status === "parsing" && <Badge variant="secondary">Parsing...</Badge>}
                        {file.status === "success" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                        {file.status === "error" && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Size: {formatFileSize(file.size)}</p>
                        {file.status === "success" && (
                          <>
                            <p>Rows: {file.rowCount.toLocaleString()}</p>
                            <p>Columns: {file.headers.length}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.headers.slice(0, 5).map((header, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {header}
                                </Badge>
                              ))}
                              {file.headers.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{file.headers.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                        {file.status === "error" && file.error && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{file.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === "success" && <Button onClick={() => useFileData(file)}>Create Charts</Button>}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.name)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Tips</CardTitle>
          <CardDescription>Get the best results from your Excel files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Use clear column headers</p>
              <p className="text-sm text-muted-foreground">First row should contain descriptive column names</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Clean your data</p>
              <p className="text-sm text-muted-foreground">Remove empty rows and ensure consistent data types</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Supported formats</p>
              <p className="text-sm text-muted-foreground">Excel 2007+ (.xlsx) and Excel 97-2003 (.xls)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
