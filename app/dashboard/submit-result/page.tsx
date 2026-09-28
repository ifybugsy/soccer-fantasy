"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Plus, Trash2, Trophy, CheckCircle2, AlertCircle, Loader2, Zap, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface GoalScorer {
  playerName: string
  matchMinute: string
}

interface FormData {
  username: string
  leagueType: string
  matchWinner: string
  homeTeamName: string
  homeTeamScore: string
  awayTeamName: string
  awayTeamScore: string
  matchScreenshot: File | null
  goalScorers: GoalScorer[]
}

export default function SubmitResultPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    leagueType: "",
    matchWinner: "",
    homeTeamName: "",
    homeTeamScore: "",
    awayTeamName: "",
    awayTeamScore: "",
    matchScreenshot: null,
    goalScorers: [],
  })

  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [syncStatus, setSyncStatus] = useState<"pending" | "syncing" | "synced">()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (PNG, JPG, etc.)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB")
      return
    }

    setUploadingFile(true)
    setErrorMessage(null)

    try {
      const preview = URL.createObjectURL(file)
      setScreenshotPreview(preview)
      setFormData((prev) => ({ ...prev, matchScreenshot: file }))
      setUploadProgress(100)
    } catch (error) {
      setErrorMessage("Failed to process screenshot")
    } finally {
      setUploadingFile(false)
    }
  }

  const removeScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }
    setScreenshotPreview(null)
    setFormData((prev) => ({ ...prev, matchScreenshot: null }))
    setUploadProgress(0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addGoalScorer = () => {
    setFormData((prev) => ({
      ...prev,
      goalScorers: [...prev.goalScorers, { playerName: "", matchMinute: "" }],
    }))
  }

  const updateGoalScorer = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      goalScorers: prev.goalScorers.map((scorer, i) => (i === index ? { ...scorer, [field]: value } : scorer)),
    }))
  }

  const removeGoalScorer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      goalScorers: prev.goalScorers.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) return "Please enter your username"
    if (!formData.leagueType) return "Please select a league type"
    if (!formData.matchWinner) return "Please select the match winner"
    if (!formData.homeTeamName.trim()) return "Please enter home team name"
    if (!formData.awayTeamName.trim()) return "Please enter away team name"
    if (!formData.homeTeamScore) return "Please enter home team score"
    if (!formData.awayTeamScore) return "Please enter away team score"
    if (!formData.matchScreenshot) return "Please upload a match screenshot"
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)
    setSyncStatus("pending")
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("username", formData.username)
      formDataToSend.append("leagueType", formData.leagueType)
      formDataToSend.append("matchWinner", formData.matchWinner)
      formDataToSend.append("homeTeamName", formData.homeTeamName)
      formDataToSend.append("homeTeamScore", formData.homeTeamScore)
      formDataToSend.append("awayTeamName", formData.awayTeamName)
      formDataToSend.append("awayTeamScore", formData.awayTeamScore)
      formDataToSend.append("goalScorers", JSON.stringify(formData.goalScorers))

      if (formData.matchScreenshot) {
        setSyncStatus("syncing")
        const uploadFormData = new FormData()
        uploadFormData.append("file", formData.matchScreenshot)
        uploadFormData.append("username", formData.username)

        const uploadResponse = await fetch("/api/v1/results/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload screenshot")
        }

        const uploadData = await uploadResponse.json()
        formDataToSend.append("matchScreenshotUrl", uploadData.url)
        formDataToSend.append("matchScreenshotPath", uploadData.pathname)
      }

      setSyncStatus("syncing")
      const response = await fetch("/api/v1/results/submit", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit result")
      }

      const data = await response.json()
      setSyncStatus("synced")

      setSuccessMessage(
        `Match result submitted successfully! Synced to ${data.leaguesUpdated} league(s). Updates are now live.`,
      )

      // Reset form
      setTimeout(() => {
        setFormData({
          username: "",
          leagueType: "",
          matchWinner: "",
          homeTeamName: "",
          homeTeamScore: "",
          awayTeamName: "",
          awayTeamScore: "",
          matchScreenshot: null,
          goalScorers: [],
        })
        removeScreenshot()
        setSyncStatus(undefined)

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 3000)
      }, 1000)
    } catch (error) {
      setSyncStatus("pending")
      setErrorMessage(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Submit Match Result</h1>
          </div>
          <p className="text-muted-foreground">
            Report your match outcome and update your league standings in real-time
          </p>
        </div>

        {/* Success Alert with Sync Status */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-center gap-2">
              {syncStatus === "synced" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {syncStatus === "syncing" && <Loader2 className="h-4 w-4 text-green-600 animate-spin" />}
            </div>
            <AlertDescription className="text-green-800 ml-6">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive ml-6">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                Player Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Your Soccer Fantasy Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="leagueType">League Type</Label>
                  <Select
                    value={formData.leagueType}
                    onValueChange={(value) => handleSelectChange("leagueType", value)}
                  >
                    <SelectTrigger id="leagueType" className="mt-2">
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic League</SelectItem>
                      <SelectItem value="h2h">Head-to-Head</SelectItem>
                      <SelectItem value="cup">Cup Tournament</SelectItem>
                      <SelectItem value="mini">Mini Cup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                Match Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="matchWinner">Match Winner</Label>
                <Select
                  value={formData.matchWinner}
                  onValueChange={(value) => handleSelectChange("matchWinner", value)}
                >
                  <SelectTrigger id="matchWinner" className="mt-2">
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Team</SelectItem>
                    <SelectItem value="away">Away Team</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeTeamName">Home Team Name</Label>
                  <Input
                    id="homeTeamName"
                    name="homeTeamName"
                    placeholder="e.g., Manchester United"
                    value={formData.homeTeamName}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="homeTeamScore">Home Team Score</Label>
                  <Input
                    id="homeTeamScore"
                    name="homeTeamScore"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.homeTeamScore}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="awayTeamName">Away Team Name</Label>
                  <Input
                    id="awayTeamName"
                    name="awayTeamName"
                    placeholder="e.g., Liverpool"
                    value={formData.awayTeamName}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="awayTeamScore">Away Team Score</Label>
                  <Input
                    id="awayTeamScore"
                    name="awayTeamScore"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.awayTeamScore}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Match Preview */}
              {formData.homeTeamName && formData.awayTeamName && (
                <div className="bg-muted/50 rounded-lg p-4 mt-4 border border-border">
                  <div className="flex items-center justify-center gap-4 text-center">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{formData.homeTeamName}</p>
                      <p className="text-2xl font-bold text-primary">{formData.homeTeamScore || "0"}</p>
                    </div>
                    <div className="text-muted-foreground font-bold">VS</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{formData.awayTeamName}</p>
                      <p className="text-2xl font-bold text-accent">{formData.awayTeamScore || "0"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goal Scorers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                Goal Scorers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.goalScorers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No goal scorers added yet</p>
              ) : (
                formData.goalScorers.map((scorer, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Player Name</Label>
                      <Input
                        placeholder="Enter player name"
                        value={scorer.playerName}
                        onChange={(e) => updateGoalScorer(index, "playerName", e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Minute</Label>
                      <Input
                        type="number"
                        placeholder="45"
                        min="0"
                        max="120"
                        value={scorer.matchMinute}
                        onChange={(e) => updateGoalScorer(index, "matchMinute", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoalScorer(index)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addGoalScorer}
                className="w-full bg-transparent border-dashed"
              >
                <Plus size={16} className="mr-2" />
                Add Goal Scorer
              </Button>
            </CardContent>
          </Card>

          {/* Match Screenshot Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </span>
                Match Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload a screenshot of the match to verify the result</p>

              {screenshotPreview ? (
                <div className="relative">
                  <img
                    src={screenshotPreview || "/placeholder.svg"}
                    alt="Match Screenshot"
                    className="w-full max-h-96 object-cover rounded-lg border border-border"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">{uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                  {uploadProgress === 100 && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready to upload
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeScreenshot}
                    className="absolute top-2 left-2"
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    disabled={uploadingFile}
                    className="hidden"
                    id="screenshot-input"
                  />
                  <label htmlFor="screenshot-input" className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-foreground">
                      {uploadingFile ? "Processing..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or GIF (max 5MB)</p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Sync Status Info */}
          {syncStatus && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {syncStatus === "syncing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {syncStatus === "synced" && <Zap className="w-4 h-4 text-primary" />}
                  {syncStatus === "pending" && <BarChart3 className="w-4 h-4 text-primary" />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {syncStatus === "syncing" && "Syncing to leagues..."}
                      {syncStatus === "synced" && "Synced to all leagues!"}
                      {syncStatus === "pending" && "Ready to submit"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {syncStatus === "syncing" && "Your result is being broadcast to all league members"}
                      {syncStatus === "synced" && "Your result is now live and visible to all league members"}
                      {syncStatus === "pending" && "Complete the form and submit to go live"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Submit Match Result
                </>
              )}
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Real-time Updates:</span> Once submitted, your match
              result will be instantly reflected in your league standings and visible to all league members. Your
              screenshot is securely stored in Vercel Blob and instantly available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
