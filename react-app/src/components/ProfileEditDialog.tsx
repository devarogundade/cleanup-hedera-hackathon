import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/hooks/use-toast";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentPhoto: string;
  onSave: (name: string, photo: string) => void;
}

const ProfileEditDialog = ({ open, onOpenChange, currentName, currentPhoto, onSave }: ProfileEditDialogProps) => {
  const { playSound } = useSettings();
  const [name, setName] = useState(currentName);
  const [photoUrl, setPhotoUrl] = useState(currentPhoto);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      playSound('error');
      return;
    }

    playSound('success');
    onSave(name.trim(), photoUrl);
    onOpenChange(false);
    toast({
      title: "Profile updated! ✨",
      description: "Your Eco Warrior profile has been updated",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { supabase } = await import("@/integrations/supabase/client");
      const { error: uploadError } = await supabase.storage
        .from('cleanup')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('cleanup')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-primary/30">
                <AvatarImage src={photoUrl} alt={name} />
                <AvatarFallback className="bg-gradient-accent text-white text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="photo-upload" 
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-8 h-8 text-primary" />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click to upload a photo (max 5MB)
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Warrior Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="border-primary/30 focus:border-primary"
            />
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="photo-url">Photo URL (optional)</Label>
            <Input
              id="photo-url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="border-primary/30 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              Or paste an image URL directly
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-primary border-0 shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)]"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
