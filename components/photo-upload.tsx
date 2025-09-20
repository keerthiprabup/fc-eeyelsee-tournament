"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Upload, X, Camera, Plus } from "lucide-react"

interface PhotoUploadData {
  title: string
  description: string
  match: string
  category: string
  tags: string[]
  photographer: string
}

export default function PhotoUpload() {
  const [uploadData, setUploadData] = useState<PhotoUploadData>({
    title: "",
    description: "",
    match: "",
    category: "match",
    tags: [],
    photographer: "",
  })
  const [newTag, setNewTag] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const categories = [
    { value: "match", label: "Match Photos" },
    { value: "action", label: "Action Shots" },
    { value: "celebration", label: "Celebrations" },
    { value: "team", label: "Team Photos" },
    { value: "crowd", label: "Crowd & Fans" },
  ]

  const matches = [
    "SFC vs PHANTOM FC",
    "FALCONS FC vs SYNERGY FC",
    "GALACTICOS vs MALABAARRRR",
    "MOODESH FC vs MANAL MAFIA",
    "CHICKEN FC vs FC EEYELSEE B",
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop logic here
  }

  const addTag = () => {
    if (newTag.trim() && !uploadData.tags.includes(newTag.trim())) {
      setUploadData({
        ...uploadData,
        tags: [...uploadData.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setUploadData({
      ...uploadData,
      tags: uploadData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle photo upload logic here
    console.log("Upload data:", uploadData)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-balance">Upload Photos</h1>
        <p className="text-muted-foreground text-balance">Share your tournament photos with the community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop your photos here</h3>
            <p className="text-muted-foreground mb-4">or click to browse files</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP up to 10MB each</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Photo Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your photo"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what's happening in the photo..."
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Match Selection */}
            <div className="space-y-2">
              <Label htmlFor="match">Related Match</Label>
              <select
                id="match"
                value={uploadData.match}
                onChange={(e) => setUploadData({ ...uploadData, match: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="">Select a match (optional)</option>
                {matches.map((match) => (
                  <option key={match} value={match}>
                    {match}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {uploadData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Photographer */}
            <div className="space-y-2">
              <Label htmlFor="photographer">Photographer</Label>
              <Input
                id="photographer"
                placeholder="Your name or organization"
                value={uploadData.photographer}
                onChange={(e) => setUploadData({ ...uploadData, photographer: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
