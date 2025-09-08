"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/upload/file-upload"
import { ChartViewer } from "@/components/charts/chart-viewer"
import { UploadHistory } from "@/components/dashboard/upload-history"
import { UserManagement } from "@/components/admin/user-management"
import { BarChart3, Upload, History, Users, LogOut, TrendingUp, FileSpreadsheet, Download } from "lucide-react"

interface DashboardProps {
  user: { email: string; role: "user" | "admin" } | null
  onLogout: () => void
}

type DashboardView = "overview" | "upload" | "charts" | "history" | "users"

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>("overview")
  const [uploadedData, setUploadedData] = useState<any[]>([])

  const handleFileUpload = (data: any[]) => {
    setUploadedData(data)
    setCurrentView("charts")
  }

  const navigationItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "charts", label: "Charts", icon: BarChart3 },
    { id: "history", label: "History", icon: History },
    ...(user?.role === "admin" ? [{ id: "users", label: "Users", icon: Users }] : []),
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold">ExcelViz Pro</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome,</span>
              <span className="font-medium">{user?.email}</span>
              <Badge variant={user?.role === "admin" ? "default" : "secondary"}>{user?.role}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden sm:block w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentView(item.id as DashboardView)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {currentView === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage your Excel data visualizations</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { title: "Total Uploads", value: "24", icon: FileSpreadsheet, change: "+2 from last week" },
                  { title: "Charts Created", value: "67", icon: BarChart3, change: "+12 from last week" },
                  { title: "Downloads", value: "156", icon: Download, change: "+23 from last week" },
                  { title: "Active Users", value: "8", icon: Users, change: "+1 from last week" },
                ].map((stat, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with your data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" onClick={() => setCurrentView("upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Excel File
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentView("charts")}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Charts
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentView("history")}>
                      <History className="h-4 w-4 mr-2" />
                      View Upload History
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest uploads</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Upload, text: "sales-data.xlsx uploaded", time: "2 hours ago" },
                      { icon: BarChart3, text: "Bar chart created", time: "3 hours ago" },
                      { icon: Download, text: "Chart exported as PNG", time: "5 hours ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <activity.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentView === "upload" && <FileUpload onFileUpload={handleFileUpload} />}
          {currentView === "charts" && <ChartViewer data={uploadedData} />}
          {currentView === "history" && <UploadHistory />}
          {currentView === "users" && user?.role === "admin" && <UserManagement />}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-card flex justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as DashboardView)}
              className={`flex flex-col items-center text-xs ${
                currentView === item.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
