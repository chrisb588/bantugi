'use client';

import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 1000000, // 1MB limit
      accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
    });

  return (
    <div className="space-y-4">
      <div className="mx-auto md:w-1/2">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer"
        >
          {preview && (
            <img
              src={preview as string}
              alt="Uploaded image"
              className="max-h-[400px] rounded-lg"
            />
          )}
          <input {...getInputProps()} type="file" />
          {isDragActive ? (
            <p>Drop the image!</p>
          ) : (
            <p>Click here or drag an image to upload it</p>
          )}
        </div>
        <div className="mt-2 text-destructive">
          {fileRejections.length !== 0 && (
            <p>Image must be less than 1MB and of type png, jpg, or jpeg</p>
          )}
        </div>
      </div>
    </div>
  );
}