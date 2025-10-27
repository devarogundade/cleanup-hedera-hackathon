import { Leaf, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

export const LandingLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo with glow effect */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-50 animate-pulse-glow"></div>

          {/* Logo container */}
          <img
            src={logo}
            className="relative w-24 h-24 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center animate-glow-pulse"
          />

          {/* Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-spin-slow" />
          <Sparkles
            className="absolute -bottom-2 -left-2 w-5 h-5 text-accent animate-spin-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* App name */}
        <div className="text-center space-y-2">
          <h1 className="font-bold text-4xl text-foreground animate-slide-up">
            CleanUp
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in">
            Loading your eco-journey...
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-64 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary animate-shimmer bg-[length:200%_100%] rounded-full"></div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
          <div
            className="w-3 h-3 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
