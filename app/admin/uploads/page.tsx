"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Trash2 } from "lucide-react"

interface ImageUpload {
  id: string
  userId: string
  userName: string
  fileName: string
  type: "profile" | "activity" | "document"
  uploadedAt: string
  status: "approved" | "pending" | "rejected"
  imageUrl: string
}

export default function ImageUploadsPage() {
  const [uploads, setUploads] = useState<ImageUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "profile" | "activity" | "document">("all")
  const [selectedImage, setSelectedImage] = useState<ImageUpload | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await fetch("/api/admin/uploads")
        const data = await response.json()
        setUploads(data.uploads || [])
      } catch (error) {
        console.error("[v0] Failed to fetch uploads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUploads()

    // Real-time updates
    const interval = setInterval(fetchUploads, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApproveImage = async (uploadId: string) => {
    try {
      const response = await fetch("/api/admin/uploads/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      })

      if (response.ok) {
        setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, status: "approved" } : u)))
      }
    } catch (error) {
      console.error("[v0] Failed to approve image:", error)
    }
  }

  const handleRejectImage = async (uploadId: string) => {
    try {
      const response = await fetch("/api/admin/uploads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      })

      if (response.ok) {
        setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, status: "rejected" } : u)))
      }
    } catch (error) {
      console.error("[v0] Failed to reject image:", error)
    }
  }

  const handleDeleteImage = async (uploadId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const response = await fetch("/api/admin/uploads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      })

      if (response.ok) {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId))
      }
    } catch (error) {
      console.error("[v0] Failed to delete image:", error)
    }
  }

  const filteredUploads = filterType === "all" ? uploads : uploads.filter((u) => u.type === filterType)

  const pendingCount = uploads.filter((u) => u.status === "pending").length

  const getTypeIcon = (type: string) => {
    return type === "profile" ? "👤" : type === "activity" ? "🎮" : "📄"
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading uploads...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Media Management</h1>
          <p className="text-muted-foreground">Review and manage user image uploads</p>
        </div>

        {/* Summary */}
        <Card className="mb-8 bg-accent/10">
          <CardContent className="flex items-center gap-4 py-4">
            <Upload className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["all", "profile", "activity", "document"] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              onClick={() => setFilterType(type)}
              className={filterType !== type ? "bg-transparent" : ""}
            >
              {getTypeIcon(type === "all" ? "activity" : type)} {getTypeLabel(type)}
            </Button>
          ))}
        </div>

        {/* Uploads Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUploads.map((upload) => (
            <Card key={upload.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={upload.imageUrl || "/placeholder.svg"}
                  alt={upload.fileName}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2">{upload.type}</Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="font-semibold text-sm line-clamp-1">{upload.fileName}</p>
                  <p className="text-xs text-muted-foreground">{upload.userName}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(upload.uploadedAt).toLocaleDateString()}
                  </span>
                  <Badge
                    variant={
                      upload.status === "approved"
                        ? "default"
                        : upload.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {upload.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(upload)
                      setShowPreview(true)
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Preview
                  </Button>
                  {upload.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproveImage(upload.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        ✓
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectImage(upload.id)}>
                        ✕
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteImage(upload.id)}
                    className="text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUploads.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No uploads found</p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-2xl w-full overflow-hidden">
              <img src={selectedImage.imageUrl || "/placeholder.svg"} alt={selectedImage.fileName} className="w-full" />
              <div className="p-4 border-t border-border">
                <div className="mb-4">
                  <p className="font-semibold">{selectedImage.fileName}</p>
                  <p className="text-sm text-muted-foreground">{selectedImage.userName}</p>
                </div>
                <Button onClick={() => setShowPreview(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
