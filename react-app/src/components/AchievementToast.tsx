import { useEffect, useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

interface Achievement {
  title: string;
  description: string;
  xp: number;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementToast = ({ achievement, onClose }: AchievementToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#8b5cf6", "#3b82f6"],
      });

      // Auto close after 5 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        const closeTimer = setTimeout(onClose, 300);
        return () => clearTimeout(closeTimer);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-slide-in">
      <div className="bg-gradient-gaming p-6 rounded-lg shadow-[0_12px_40px_hsl(220_10%_50%_/_0.25)] border-2 border-accent/50 min-w-[320px] relative">
        <button
          onClick={() => {
            setIsVisible(false);
            const closeTimer = setTimeout(onClose, 300);
            // Note: cleanup handled by component unmount
          }}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
          aria-label="Close achievement notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-in">
            <Trophy className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <p className="text-sm font-semibold text-white/90">Achievement Unlocked!</p>
            </div>
            <h4 className="text-lg font-bold text-white mb-1">{achievement.title}</h4>
            <p className="text-sm text-white/80 mb-2">{achievement.description}</p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                +{achievement.xp} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
