import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  Menu,
  Leaf,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import useHashConnect from "@/hooks/useHashConnect";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const { currentRound, setCurrentRound, lastestRound } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { accountId, isLoading, connect, disconnect } = useHashConnect();

  const handleButtonClick = (action: () => void) => {
    playSound("click");
    action();
  };

  const handlePreviousRound = () => {
    if (currentRound > 1) {
      const newRound = currentRound - 1;
      setCurrentRound(newRound);
      navigate(`/app/${newRound}`);
    }
  };

  const handleNextRound = () => {
    if (currentRound < lastestRound.id) {
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      navigate(`/app/${newRound}`);
    }
  };

  const handleWalletConnect = () => {
    playSound("click");
    connect();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50 h-[60px] sm:h-[70px]">
      <div className="w-full h-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-full gap-2">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary shadow-[0_4px_16px_hsl(220_10%_50%_/_0.2)] group-hover:scale-110 transition-transform flex items-center justify-center animate-glow-pulse">
                <Leaf className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                CleanUp
              </span>
            </Link>

            {/* Desktop Round Navigation */}
            {location.pathname.startsWith("/app") && (
              <TooltipProvider>
                <div className="hidden sm:flex items-center gap-4 bg-secondary rounded-lg px-8 py-1 min-w-[280px] justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleButtonClick(handlePreviousRound)}
                        disabled={currentRound === 1}
                        className="hover:bg-primary/10 rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous Round</TooltipContent>
                  </Tooltip>

                  <div className="text-center max-w-full w-[200px]">
                    <p className="text-xs text-muted-foreground">Round</p>
                    <p className="text-lg font-bold text-foreground">
                      {currentRound} / {lastestRound?.id}
                    </p>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleButtonClick(handleNextRound)}
                        disabled={currentRound === lastestRound?.id}
                        className="hover:bg-primary/10 rounded-full"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next Round</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <SoundToggle />
            <Link to="/rewards">
              <Button
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all hover:scale-105"
                onClick={() => playSound("click")}
              >
                Rewards
              </Button>
            </Link>
            {accountId ? (
              <Button className="bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] hover:scale-105 max-w-[200px]">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate font-mono text-sm">{accountId}</span>
              </Button>
            ) : (
              <Button
                className="bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] hover:scale-105"
                onClick={handleWalletConnect}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground text-xs px-2"
              onClick={handleWalletConnect}
            >
              <Wallet className="w-4 h-4" />
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {/* Round Navigation - Mobile */}
                  {location.pathname.startsWith("/app") && (
                    <div className="bg-secondary rounded-lg p-4 mb-2">
                      <p className="text-xs text-muted-foreground mb-3 text-center">
                        Current Round
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleButtonClick(handlePreviousRound);
                            setIsMenuOpen(false);
                          }}
                          disabled={currentRound === 1}
                          className="h-9 w-9"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">
                            {currentRound} / {lastestRound?.id}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleButtonClick(handleNextRound);
                            setIsMenuOpen(false);
                          }}
                          disabled={currentRound === lastestRound?.id}
                          className="h-9 w-9"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <Link to="/rewards" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-primary/30 hover:bg-primary/10"
                      onClick={() => playSound("click")}
                    >
                      Rewards
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Sound</span>
                    <SoundToggle />
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={() => {
                      handleWalletConnect();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
