import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface EditProfileCardProps {
  label?: string;
  initialEmail?: string;
  currentAvatar?: string;
  isUpdating?: boolean;
  onConfirm: (data: { email?: string; avatar?: File }) => void;
  onCancel: () => void;
}

export default function EditProfileCard({
  label = "Edit Profile",
  initialEmail = "",
  currentAvatar,
  isUpdating = false,
  onConfirm,
  onCancel,
}: EditProfileCardProps) {
  const [email, setEmail] = useState(initialEmail);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only images are allowed.');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File too large. Maximum size is 5MB.');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: { email?: string; avatar?: File } = {};
    
    if (email && email !== initialEmail) {
      updateData.email = email;
    }
    
    if (avatarFile) {
      updateData.avatar = avatarFile;
    }

    // Only proceed if there are changes
    if (Object.keys(updateData).length > 0) {
      onConfirm(updateData);
    } else {
      onCancel();
    }
  };

  const displayAvatar = avatarPreview || currentAvatar || "/img/avatar.png";
  
  return (
    <div className="pointer-events-auto">
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <Label htmlFor="avatar" className="text-sm font-medium">
                Profile Picture
              </Label>
              
              <div className="relative">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Image
                    src={displayAvatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveAvatar}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
                id="avatar"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                Choose Image
              </Button>
            </div>

            {/* Email Section */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
