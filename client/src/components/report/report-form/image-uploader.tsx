"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images?: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images = [], onChange }: ImageUploaderProps) {
  const [previews, setPreviews] = React.useState<string[]>(images);
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const newLocalPreviews: string[] = [];
      const uploadedImageUrls: string[] = [];

      setIsUploading(true);

      try {
        for (const file of acceptedFiles) {
          try {
            // Generate local preview
            const preview = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            newLocalPreviews.push(preview);

            // Upload the file
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              toast.error(`Upload failed for ${file.name}: ${errorData.error || 'Server error'}`);
              console.error('Upload failed:', errorData);
              continue;
            }

            const result = await response.json();
            console.log('ImageUploader - /api/upload response result:', JSON.stringify(result, null, 2));
            if (result.fileUrl) {
              uploadedImageUrls.push(result.fileUrl);
            } else {
              toast.error(`Upload succeeded for ${file.name} but no URL was returned.`);
              console.error('Upload succeeded but no URL returned:', result);
            }
          } catch (error) {
            toast.error(`Error processing or uploading ${file.name}.`);
            console.error('Error processing or uploading file:', error);
          }
        }

        if (newLocalPreviews.length > 0) {
          setPreviews(prev => [...prev, ...newLocalPreviews]);
        }
        if (uploadedImageUrls.length > 0) {
          onChange([...images, ...uploadedImageUrls]);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [images, onChange]
  );

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 10,
    maxSize: 25000000,
    accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Image preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`bg-muted flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg p-4 inner-shadow relative ${
            isUploading ? 'opacity-70' : ''
          }`}
        >
          <Input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Uploading images...</p>
            </div>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <div className="text-center text-sm font-medium">
                {isDragActive ? (
                  <p>Drop the images here</p>
                ) : (
                  <p>Click or drag images to upload</p>
                )}
              </div>
            </>
          )}
        </div>

        {fileRejections.length > 0 && (
          <p className="text-sm text-destructive text-center">
            Files must be images under 25MB
          </p>
        )}
      </div>
    </div>
  );
}