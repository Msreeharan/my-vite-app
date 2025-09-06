"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Upload, TrendingUp } from "lucide-react"

interface LoginFormProps {
  onLogin: (email: string, role: "user" | "admin") => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent, role: "user" | "admin") => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      onLogin(email, role)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">ExcelViz Pro</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-balance">Transform Your Excel Data In Visualizations</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Upload, analyze, and create stunning 2D/3D charts from your Excel files. Perfect for business intelligence
              and data-driven decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card">
              <Upload className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Easy Upload</h3>
              <p className="text-sm text-muted-foreground text-center">Drag & drop Excel files</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Smart Charts</h3>
              <p className="text-sm text-muted-foreground text-center">2D & 3D visualizations</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Export Ready</h3>
              <p className="text-sm text-muted-foreground text-center">Download as PNG/PDF</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to start analyzing your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User Login</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleSubmit(e, "user")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In as User"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleSubmit(e, "admin")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p>User: user@demo.com / password</p>
              <p>Admin: admin@demo.com / password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
