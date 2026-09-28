"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/hooks/use-admin-auth"
import { Spinner } from "@/components/ui/spinner"

export interface AdminAuthGuardProps {
  children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAdminAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
