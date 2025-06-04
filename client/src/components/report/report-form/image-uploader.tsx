"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images?: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images = [], onChange }: ImageUploaderProps) {
  const [previews, setPreviews] = React.useState<string[]>(images);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const newPreviews: string[] = [];
      const newImages: string[] = [];

      for (const file of acceptedFiles) {
        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newPreviews.push(preview);
          newImages.push(preview); // In real app, you'd upload to server and store URLs
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }

      setPreviews(prev => [...prev, ...newPreviews]);
      onChange([...images, ...newImages]);
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
    maxSize: 25000000, // 25MB
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
          className="bg-muted flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg p-4 inner-shadow"
        >
          <Input {...getInputProps()} />
          <ImagePlus className="h-8 w-8" />
          <div className="text-center text-sm font-medium">
            {isDragActive ? (
              <p>Drop the images here</p>
            ) : (
              <p>Click or drag images to upload</p>
            )}
          </div>
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