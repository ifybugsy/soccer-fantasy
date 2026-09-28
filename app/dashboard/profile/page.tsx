"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "PlayerName",
    email: "player@example.com",
    phone: "+234 812 345 6789",
    country: "Nigeria",
    preferredCurrency: "NGN",
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Account Information</CardTitle>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="bg-transparent">
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-primary mt-2" />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                ) : (
                  <p className="text-foreground">{formData.username}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-primary mt-2" />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                ) : (
                  <p className="text-foreground">{formData.email}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-primary mt-2" />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                ) : (
                  <p className="text-foreground">{formData.phone}</p>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-primary mt-2" />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Country</label>
                {isEditing ? (
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  >
                    <option>Nigeria</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Ghana</option>
                  </select>
                ) : (
                  <p className="text-foreground">{formData.country}</p>
                )}
              </div>
            </div>

            {/* Preferred Currency */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Currency</label>
              {isEditing ? (
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                >
                  <option>NGN - Nigerian Naira</option>
                  <option>USD - US Dollar</option>
                  <option>GBP - British Pound</option>
                </select>
              ) : (
                <p className="text-foreground">{formData.preferredCurrency}</p>
              )}
            </div>

            {isEditing && <Button className="w-full">Save Changes</Button>}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                Change Password
              </Button>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Badge variant="secondary">Disabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
