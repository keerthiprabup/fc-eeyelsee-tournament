import Navigation from "@/components/navigation"
import PhotoGallery from "@/components/photo-gallery"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/gallery/upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Photos
              </Link>
            </Button>
          </div>
        </div>
        <PhotoGallery />
      </main>
    </div>
  )
}
