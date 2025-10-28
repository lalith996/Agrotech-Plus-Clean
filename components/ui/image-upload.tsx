import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  onRemove: (url: string) => void
  maxFiles?: number
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  maxFiles = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (value.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`)
      return
    }

    setUploading(true)

    try {
      const newUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create a data URL for preview
        const reader = new FileReader()
        
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            newUrls.push(reader.result as string)
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Display existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxFiles && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-emerald-500 transition-colors">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? "Uploading..." : "Click to upload images"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP up to 10MB ({value.length}/{maxFiles} uploaded)
            </p>
          </label>
        </div>
      )}

      {value.length >= maxFiles && (
        <p className="text-sm text-gray-500 text-center">
          Maximum number of images reached
        </p>
      )}
    </div>
  )
}
