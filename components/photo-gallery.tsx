"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Search, Filter, Download, Share2, Heart, Eye, Calendar, Users } from "lucide-react"
import Image from "next/image"

interface GalleryPhoto {
  id: string
  url: string
  title: string
  description?: string
  match?: string
  teams?: string[]
  date: string
  photographer?: string
  tags: string[]
  likes: number
  views: number
  category: "match" | "celebration" | "team" | "action" | "crowd"
}

const galleryPhotos: GalleryPhoto[] = [
  {
    id: "1",
    url: "/football-match-action-shot.jpg",
    title: "SFC vs PHANTOM FC - Opening Goal",
    description: "John Doe scores the opening goal for SFC in the 15th minute",
    match: "SFC vs PHANTOM FC",
    teams: ["SFC", "PHANTOM FC"],
    date: "2025-01-20",
    photographer: "Tournament Media Team",
    tags: ["goal", "action", "sfc", "round1"],
    likes: 24,
    views: 156,
    category: "action",
  },
  {
    id: "2",
    url: "/football-team-celebration.jpg",
    title: "SYNERGY FC Victory Celebration",
    description: "SYNERGY FC players celebrate their 3-1 victory over FALCONS FC",
    match: "FALCONS FC vs SYNERGY FC",
    teams: ["SYNERGY FC", "FALCONS FC"],
    date: "2025-01-20",
    photographer: "Tournament Media Team",
    tags: ["celebration", "victory", "synergy", "round1"],
    likes: 31,
    views: 203,
    category: "celebration",
  },
  {
    id: "3",
    url: "/football-crowd-cheering.jpg",
    title: "Passionate Crowd Support",
    description: "Fans cheering during the MOODESH FC vs MANAL MAFIA match",
    match: "MOODESH FC vs MANAL MAFIA",
    teams: ["MOODESH FC", "MANAL MAFIA"],
    date: "2025-01-20",
    photographer: "Fan Contributor",
    tags: ["crowd", "fans", "atmosphere", "support"],
    likes: 18,
    views: 89,
    category: "crowd",
  },
  {
    id: "4",
    url: "/football-team.png",
    title: "MALABAARRRR Team Photo",
    description: "MALABAARRRR team poses before their match against GALACTICOS",
    match: "GALACTICOS vs MALABAARRRR",
    teams: ["MALABAARRRR", "GALACTICOS"],
    date: "2025-01-20",
    photographer: "Tournament Media Team",
    tags: ["team", "portrait", "malabaarrrr", "prematch"],
    likes: 15,
    views: 67,
    category: "team",
  },
  {
    id: "5",
    url: "/football-goalkeeper-save.jpg",
    title: "Spectacular Goalkeeper Save",
    description: "Amazing save during the PHANTOM FC vs SFC match",
    match: "SFC vs PHANTOM FC",
    teams: ["SFC", "PHANTOM FC"],
    date: "2025-01-20",
    photographer: "Action Sports Photo",
    tags: ["goalkeeper", "save", "action", "defense"],
    likes: 42,
    views: 234,
    category: "action",
  },
  {
    id: "6",
    url: "/football-tournament-trophy.jpg",
    title: "Tournament Trophy Display",
    description: "The FC EEYELSEE 7's Football Tournament trophy on display",
    date: "2025-01-20",
    photographer: "Tournament Media Team",
    tags: ["trophy", "tournament", "prize", "championship"],
    likes: 28,
    views: 145,
    category: "celebration",
  },
]

const PhotoCard = ({ photo, onPhotoClick }: { photo: GalleryPhoto; onPhotoClick: (photo: GalleryPhoto) => void }) => (
  <Card className="group cursor-pointer overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image
        src={photo.url || "/placeholder.svg"}
        alt={photo.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        onClick={() => onPhotoClick(photo)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Badge className="bg-black/50 text-white border-none">
          <Eye className="w-3 h-3 mr-1" />
          {photo.views}
        </Badge>
      </div>
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="bg-black/50 text-white border-none capitalize">
          {photo.category}
        </Badge>
      </div>
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-balance">{photo.title}</h3>
      {photo.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{photo.description}</p>}

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(photo.date).toLocaleDateString()}</span>
        </div>
        {photo.match && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">{photo.match}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">{photo.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{photo.views}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {photo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {photo.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {photo.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{photo.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </CardContent>
  </Card>
)

const PhotoLightbox = ({
  photo,
  isOpen,
  onClose,
}: { photo: GalleryPhoto | null; isOpen: boolean; onClose: () => void }) => {
  if (!photo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full">
            <Image src={photo.url || "/placeholder.svg"} alt={photo.title} fill className="object-contain" />
          </div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl text-balance">{photo.title}</DialogTitle>
            </DialogHeader>
            {photo.description && <p className="text-muted-foreground mt-2">{photo.description}</p>}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                {photo.match && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{photo.match}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(photo.date).toLocaleDateString()}</span>
                </div>
                {photo.photographer && (
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">{photo.photographer}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{photo.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{photo.views}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const handlePhotoClick = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo)
    setIsLightboxOpen(true)
  }

  const filteredPhotos = galleryPhotos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = ["all", "match", "action", "celebration", "team", "crowd"]
  const categoryLabels = {
    all: "All Photos",
    match: "Match Photos",
    action: "Action Shots",
    celebration: "Celebrations",
    team: "Team Photos",
    crowd: "Crowd & Fans",
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Camera className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-balance">Tournament Gallery</h1>
        </div>
        <p className="text-muted-foreground text-balance">
          Capture the excitement and memorable moments from the FC EEYELSEE 7's Football Tournament
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search photos by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary mb-1">{galleryPhotos.length}</div>
            <p className="text-sm text-muted-foreground">Total Photos</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {galleryPhotos.reduce((sum, photo) => sum + photo.likes, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Likes</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {galleryPhotos.reduce((sum, photo) => sum + photo.views, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary mb-1">4</div>
            <p className="text-sm text-muted-foreground">Matches Covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Grid */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {categoryLabels[category as keyof typeof categoryLabels].split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onPhotoClick={handlePhotoClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lightbox */}
      <PhotoLightbox photo={selectedPhoto} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} />
    </div>
  )
}
