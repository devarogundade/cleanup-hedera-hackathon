import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Target, Pencil, User } from "lucide-react";
import ProfileEditDialog from "./ProfileEditDialog";
import XPLevelsDialog from "./XPLevelsDialog";
import useHashConnect from "@/hooks/useHashConnect";

const UserStatsBar = () => {
  const { accountId } = useHashConnect();

  const userLevel = 7;
  const currentXP = 350;
  const xpForNextLevel = 500;
  const progressPercent = (currentXP / xpForNextLevel) * 100;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [xpDialogOpen, setXpDialogOpen] = useState(false);
  const [userName, setUserName] = useState("Eco Warrior");
  const [userPhoto, setUserPhoto] = useState("");

  useEffect(() => {
    // Load user profile from localStorage
    const savedName = localStorage.getItem("userName");
    const savedPhoto = localStorage.getItem("userPhoto");
    if (savedName) setUserName(savedName);
    if (savedPhoto) setUserPhoto(savedPhoto);
  }, []);

  const handleSaveProfile = (name: string, photo: string) => {
    setUserName(name);
    setUserPhoto(photo);
    localStorage.setItem("userName", name);
    localStorage.setItem("userPhoto", photo);
  };

  return (
    <>
      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentName={userName}
        currentPhoto={userPhoto}
        onSave={handleSaveProfile}
      />
      <XPLevelsDialog
        open={xpDialogOpen}
        onOpenChange={setXpDialogOpen}
        currentLevel={userLevel}
        currentXP={currentXP}
      />
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Profile Section */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative group">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 border-primary transition-transform group-hover:scale-105">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {userLevel}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold border-2 border-card">
                {userLevel}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-base sm:text-lg">{userName}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-primary/10"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Level {userLevel} Eco Warrior
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div
            className="flex-1 max-w-full sm:max-w-md cursor-pointer hover-scale w-full sm:w-auto"
            onClick={() => setXpDialogOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setXpDialogOpen(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">
                XP Progress
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentXP} / {xpForNextLevel}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2 sm:h-3" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Click to view all levels
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-primary mb-1">
                <Trophy className="w-4 h-4" />
                <span className="font-bold">12</span>
              </div>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-accent mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-bold">3</span>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-primary-glow mb-1">
                <Target className="w-4 h-4" />
                <span className="font-bold">47</span>
              </div>
              <p className="text-xs text-muted-foreground">Fractions</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default UserStatsBar;
