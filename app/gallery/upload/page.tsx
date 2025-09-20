import Navigation from "@/components/navigation"
import PhotoUpload from "@/components/photo-upload"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <PhotoUpload />
      </main>
    </div>
  )
}
