"use client"

import type React from "react"
import Link from "next/link"
import { LayoutDashboard, Users, Trophy, BarChart3, LogOut, Menu, X, FileCheck, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/lib/hooks/use-admin-auth"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { useState } from "react"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { logout, adminInfo } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-transparent">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 bg-card border-r border-border flex flex-col fixed md:relative h-screen z-40 md:z-auto transition-transform`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="font-bold text-lg">Admin Panel</h1>
          {adminInfo && <p className="text-xs text-muted-foreground mt-1">Logged in as {adminInfo.userId}</p>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition">
            <Users size={20} /> Users
          </Link>
          <Link href="/admin/results" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition">
            <FileCheck size={20} /> Results
          </Link>
          <Link
            href="/admin/sync-monitor"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition"
          >
            <Activity size={20} /> Sync Monitor
          </Link>
          <Link href="/admin/leagues" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition">
            <Trophy size={20} /> Leagues
          </Link>
          <Link
            href="/admin/leagues/management"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            League Management
          </Link>
          <Link
            href="/admin/withdrawals"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            Withdrawals
          </Link>
          <Link
            href="/admin/deposits"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            Deposits
          </Link>
          <Link
            href="/admin/uploads"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            Image Uploads
          </Link>
          <Link
            href="/admin/broadcasts"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            Live Streams
          </Link>
          <Link
            href="/admin/sync-center"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition text-sm ml-6"
          >
            Data Sync
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition"
          >
            <BarChart3 size={20} /> Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground">Admin Control</p>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full flex gap-2 bg-transparent hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-12 md:pt-0">{children}</div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthGuard>
  )
}
