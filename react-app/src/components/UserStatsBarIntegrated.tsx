import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Target, Pencil } from "lucide-react";
import ProfileEditDialog from "./ProfileEditDialog";
import XPLevelsDialog from "./XPLevelsDialog";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { StatsLoadingState } from "./LoadingState";
import useHashConnect from "@/hooks/useHashConnect";

const UserStatsBarIntegrated = () => {
  const { accountId } = useHashConnect();

  const { data: profile, isLoading } = useProfile(accountId);
  const updateProfile = useUpdateProfile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [xpDialogOpen, setXpDialogOpen] = useState(false);

  if (isLoading) {
    return <StatsLoadingState />;
  }

  if (!profile) return null;

  const xpForNextLevel = profile.level * 100;
  const progressPercent = (profile.total_xp / xpForNextLevel) * 100;

  const handleSaveProfile = (name: string, photo: string) => {
    updateProfile.mutate({
      accountId: accountId,
      updates: { username: name, avatar_url: photo },
    });
  };

  return (
    <>
      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentName={profile.username || "Eco Warrior"}
        currentPhoto={profile.avatar_url || ""}
        onSave={handleSaveProfile}
      />
      <XPLevelsDialog
        open={xpDialogOpen}
        onOpenChange={setXpDialogOpen}
        currentLevel={profile.level}
        currentXP={profile.total_xp}
      />
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Profile Section */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative group">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 border-primary transition-transform group-hover:scale-105">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.username || ""}
                />
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {profile.level}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold border-2 border-card">
                {profile.level}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-base sm:text-lg">
                  {profile.username || "Eco Warrior"}
                </p>
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
                Level {profile.level} Eco Warrior
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
                {profile.total_xp} / {xpForNextLevel}
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
                <span className="font-bold">{profile.total_nfts}</span>
              </div>
              <p className="text-xs text-muted-foreground">NFTs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-accent mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{profile.current_streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-primary-glow mb-1">
                <Target className="w-4 h-4" />
                <span className="font-bold">{profile.total_fractions}</span>
              </div>
              <p className="text-xs text-muted-foreground">Fractions</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default UserStatsBarIntegrated;
