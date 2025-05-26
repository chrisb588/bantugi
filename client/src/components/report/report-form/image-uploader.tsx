"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size !== 0, "Please upload an image"),
});

export default function ImageUploader() {
  const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    resetField,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      image: new File([""], "filename"),
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const reader = new FileReader();
      try {
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(acceptedFiles[0]);
        setValue("image", acceptedFiles[0]);
        clearErrors("image");
      } catch (error) {
        setPreview(null);
        resetField("image");
      }
    },
    [setValue, clearErrors, resetField]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 10,
      maxSize: 100000000,
      accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
    });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast.success(`Image uploaded successfully 🎉 ${values.image.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto md:w-1/2">
        <label
          className={`block mb-2 text-xl font-semibold tracking-tight ${
            fileRejections.length !== 0 ? "text-destructive" : ""
          }`}
        >
          Upload your image
        </label>
        <div
          {...getRootProps()}
          className="bg-muted mx-auto flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg p-8 inner-shadow"
        >
          {preview && (
            <img
              src={preview as string}
              alt="Uploaded image"
              className="max-h-[400px] rounded-lg"
            />
          )}
          <ImagePlus className={`size-20 ${preview ? "hidden" : "block"}`} />
          <Input {...getInputProps()} type="file" />
          <div className="text-center text-sm font-medium">
            {isDragActive ? (
              <div>Drop the image!</div>
            ) : (
              <div>Click here or drag an image to upload it</div>
            )}
          </div>
        </div>
        <div className="mt-2 text-destructive">
          {errors.image && <p>{errors.image.message as string}</p>}
          {fileRejections.length !== 0 && (
            <div className="text-center text-sm font-medium">
              Image must be less than 1MB and of type png, jpg, or jpeg
            </div>
          )}
        </div>
      </div>
    </div>
  );
}