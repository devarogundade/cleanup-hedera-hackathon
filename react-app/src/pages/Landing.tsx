import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Wallet,
  MapPin,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Heart,
  Leaf,
  Waves,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_CONFIG, ROUTES, SOCIAL_LINKS } from "@/data/constants";
import {
  HOW_IT_WORKS_STEPS,
  IMPACT_METRICS,
  IMPACT_FEATURES,
} from "@/data/mockData";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRounds } from "@/hooks/useRounds";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LandingLoader } from "@/components/LandingLoader";
import logo from "@/assets/logo.png";
import hbarLogo from "@/assets/hbar-logo.png";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: rounds } = useRounds();

  // Calculate real stats from Supabase
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      // Get total rounds with donations
      const { data: roundsData, error: roundsError } = await supabase
        .from("rounds")
        .select("donated_fractions, total_amount, participant_count");

      if (roundsError) throw roundsError;

      // Get total active users
      const { count: userCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("total_donations", 0);

      if (usersError) throw usersError;

      // Get total achievements
      const { count: achievementCount, error: achievementsError } =
        await supabase
          .from("user_achievements")
          .select("*", { count: "exact", head: true })
          .not("unlocked_at", "is", null);

      if (achievementsError) throw achievementsError;

      const sitesCount = roundsData.filter(
        (r) => r.donated_fractions === r.donated_fractions
      ).length;
      const totalDonations = roundsData.reduce(
        (sum, r) => sum + Number(r.total_amount),
        0
      );

      return {
        sitesCount,
        totalDonations: `$${(totalDonations * 0.05).toFixed(1)}M`, // Convert HBAR to approx USD
        activeUsers: userCount || 0,
        achievements: achievementCount || 0,
      };
    },
  });

  const currentRound = rounds?.[rounds.length - 1];
  const currentRoundMetadata = currentRound;
  const LANDING_STATS = [
    {
      icon: "Target",
      value: stats?.sitesCount.toString() || "0",
      label: "Sites Cleaned",
      color: "text-primary",
    },
    {
      icon: "TrendingUp",
      value: stats?.totalDonations || "$0",
      label: "Total Donations",
      color: "text-accent",
    },
    {
      icon: "Users",
      value: `${stats?.activeUsers || 0}+`,
      label: "Active Heroes",
      color: "text-primary-glow",
    },
    {
      icon: "Trophy",
      value: stats?.achievements.toString() || "0",
      label: "Achievements",
      color: "text-accent",
    },
  ];

  if (!rounds || !stats) return <LandingLoader />;

  return (
    <>
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-sm fixed w-full top-0 z-50 h-[60px] sm:h-[70px]">
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
            <img
              src={logo}
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl shadow-[0_4px_16px_hsl(220_10%_50%_/_0.2)] group-hover:scale-110 transition-transform flex items-center justify-center"
            />
            <span className="font-bold text-xl sm:text-2xl text-foreground">
              CleanUp
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a
              href="#current-round"
              className="text-sm hover:text-primary transition-colors font-medium"
            >
              Current Round
            </a>
            <Link
              to={ROUTES.HOW_IT_WORKS}
              className="text-sm hover:text-primary transition-colors font-medium"
            >
              How it Works
            </Link>
            <Link
              to={ROUTES.LEADERBOARD}
              className="text-sm hover:text-primary transition-colors font-medium"
            >
              Leaderboard
            </Link>
            <a
              href="#impact"
              className="text-sm hover:text-primary transition-colors font-medium"
            >
              Impact
            </a>
            <ThemeToggle />
          </nav>

          {/* Desktop Launch Button */}
          <Link
            to={ROUTES.APP_ROUND(currentRound?.id || 5)}
            className="hidden md:block"
          >
            <Button
              variant="default"
              className="gap-2 bg-gradient-primary border-0 shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] hover:scale-105 transition-transform"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link to={ROUTES.APP_ROUND(currentRound?.id || 5)}>
              <Button
                size="sm"
                className="gap-1 bg-gradient-primary border-0 text-xs px-3"
              >
                Launch <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <a
                    href="#current-round"
                    className="text-sm hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Current Round
                  </a>
                  <Link
                    to={ROUTES.HOW_IT_WORKS}
                    className="text-sm hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link
                    to={ROUTES.LEADERBOARD}
                    className="text-sm hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                  <a
                    href="#impact"
                    className="text-sm hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Impact
                  </a>
                  <Link
                    to={ROUTES.APP_ROUND(currentRound?.id || 5)}
                    className="mt-4"
                  >
                    <Button className="w-full bg-gradient-primary border-0">
                      Launch App <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-glow/5 rounded-full blur-3xl"></div>
        </div>

        <div className="hero-bg w-full">
          <iframe
            className="hero-iframe"
            src="https://www.youtube.com/embed/aAVQAvkD7pw?autoplay=1&loop=1&mute=1&controls=0&playlist=aAVQAvkD7pw"
            title="YouTube video background"
            frameBorder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24 text-center relative z-10">
          <div className="hero-bg w-full">
            <iframe
              className="hero-iframe"
              src="https://www.youtube.com/embed/aAVQAvkD7pw?autoplay=1&loop=1&mute=1&controls=0&playlist=aAVQAvkD7pw"
              title="YouTube video background"
              frameBorder="0"
              allow="autoplay; fullscreen"
            ></iframe>
          </div>

          <div className="flex flex-col items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className="text-sm px-6 py-3 bg-background border-primary/30 mt-10"
            >
              <img
                src={hbarLogo}
                alt="Hedera"
                className="w-4 h-4 mr-2 inline"
              />
              Built on Hedera Blockchain
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 animate-slide-up text-foreground px-4 leading-tight">
            Clean the Planet,
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              Earn Rewards
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed px-4">
            Join the gamified revolution in environmental cleanup. Tokenize
            trash sites, earn XP, level up, and make real impact while
            collecting unique NFTs! 🎮
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <Link to={ROUTES.APP_ROUND(currentRound?.id || 5)}>
              <Button
                size="lg"
                className="gap-3 text-lg px-8 py-6 bg-gradient-primary border-0 shadow-glow hover:scale-110 transition-all animate-glow-pulse"
              >
                <Wallet className="w-6 h-6" />
                Start Your Journey
              </Button>
            </Link>
            <Link to={ROUTES.LEADERBOARD}>
              <Button
                size="lg"
                variant="outline"
                className="gap-3 text-lg px-8 py-6 hover:scale-105 transition-transform border-2 bg-background"
              >
                <Trophy className="w-6 h-6" />
                View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto px-4">
            {LANDING_STATS.map((stat, index) => {
              const IconComponent = {
                Target,
                TrendingUp,
                Users,
                Trophy,
              }[stat.icon];
              return (
                <Card
                  key={index}
                  className="p-3 sm:p-6 text-center bg-card/50 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all hover:scale-105 sm:hover:scale-110 hover:shadow-[0_12px_40px_hsl(220_10%_50%_/_0.3)] cursor-pointer group animate-bounce-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {IconComponent && (
                    <IconComponent
                      className={`w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 ${stat.color} group-hover:scale-125 transition-transform flex-shrink-0`}
                    />
                  )}
                  <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground font-medium leading-tight">
                    {stat.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Current Round Section */}
        <section
          id="current-round"
          className="py-24 bg-background/80 backdrop-blur-sm relative"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-background">
                <Calendar className="w-4 h-4 mr-2" />
                Active Now
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground px-4">
                Current Cleanup Round
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Join the ongoing environmental cleanup mission
              </p>
            </div>

            {currentRoundMetadata && (
              <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Round Number
                      </div>
                      <div className="text-4xl font-bold text-primary">
                        #{currentRound?.id}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Location
                      </div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <MapPin className="w-5 h-5 text-primary" />
                        {currentRoundMetadata?.location.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Type
                      </div>
                      <Badge className="text-sm px-4 py-2 bg-primary text-primary-foreground">
                        {currentRoundMetadata?.type === "tree-planting"
                          ? "🌱 Tree Planting"
                          : "🌊 Ocean Cleanup"}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Started
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {currentRoundMetadata &&
                          new Date(
                            currentRoundMetadata.creationTime
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-3 text-foreground">
                        Make Your Impact
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {currentRoundMetadata?.type === "tree-planting"
                          ? "Support tree planting initiatives and help restore our forests. Every fraction sponsored makes a difference."
                          : "Help clean up ocean waste and protect marine life. Your contribution creates real environmental change."}
                      </p>
                      <Link to={ROUTES.APP_ROUND(currentRound?.id || 5)}>
                        <Button
                          size="lg"
                          className="w-full md:w-auto gap-3 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] transition-all hover:scale-105"
                        >
                          <Sparkles className="w-5 h-5" />
                          Join Round {currentRound?.id}
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Hedera Blockchain Section */}
        <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-background">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise-Grade Blockchain
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Why We Use Hedera
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We chose Hedera as our blockchain infrastructure because it
                perfectly aligns with our environmental mission - offering
                unprecedented speed, security, and sustainability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Zap,
                  title: "Instant Transactions",
                  description:
                    "With 10,000+ TPS and 3-5 second finality, donations and NFT mints happen instantly without delays or network congestion",
                  stat: "3-5 sec finality",
                },
                {
                  icon: Leaf,
                  title: "Environmentally Aligned",
                  description:
                    "As a carbon-negative blockchain, Hedera practices what we preach - every transaction actually helps the environment",
                  stat: "-0.01 kg CO₂/tx",
                },
                {
                  icon: Lock,
                  title: "Predictable Low Costs",
                  description:
                    "Fixed transaction fees ($0.0001) mean 100% of your donation goes to environmental impact, not gas fees",
                  stat: "$0.0001 per tx",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="p-8 hover:shadow-[0_20px_60px_hsl(220_10%_40%_/_0.25)] transition-all hover:-translate-y-2 border-2 border-transparent hover:border-primary/30 group relative overflow-hidden bg-card"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="text-sm font-mono text-primary font-semibold">
                    {feature.stat}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-12 flex-wrap">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium">
                  Low Fixed Fees ($0.0001)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium">
                  Energy Efficient
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium">
                  Transparent & Auditable
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background">
                <Target className="w-4 h-4 mr-2" />
                Simple Process
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                How It Works
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Follow these simple steps to start making impact and earning
                rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {HOW_IT_WORKS_STEPS.map((step, index) => {
                const IconComponent = {
                  MapPin,
                  Heart,
                  Users,
                  Award,
                }[step.icon];
                return (
                  <div key={index} className="relative">
                    {index < 3 && (
                      <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -ml-4"></div>
                    )}
                    <Card className="p-8 text-center hover:shadow-[0_20px_60px_hsl(220_10%_40%_/_0.25)] transition-all hover:scale-105 relative overflow-hidden group border-2 hover:border-primary/50 bg-card">
                      <div className="absolute -top-6 -right-6 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                        {index + 1}
                      </div>
                      <div
                        className={`w-20 h-20 rounded-2xl ${step.color} mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform relative z-10`}
                      >
                        {IconComponent && (
                          <IconComponent className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section
          id="impact"
          className="py-24 bg-gradient-to-br from-primary/5 to-accent/5"
        >
          <div className="container mx-auto px-6">
            {/* Gameplay Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 bg-background">
                  <Trophy className="w-4 h-4 mr-2" />
                  Eco-Fighter Game
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">
                  Play. Fight. Save the Planet
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Unlock our endless mission-based game after your first
                  donation. Collect trash, plant trees, and earn XP through
                  exciting gameplay!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    icon: Target,
                    title: "Endless Missions",
                    description:
                      "Play through unlimited scenes with unique challenges. Each mission tests your eco-warrior skills!",
                  },
                  {
                    icon: Sparkles,
                    title: "Win to Earn",
                    description:
                      "Beat the bad citizens opponent to earn XP and level up. Accumulate rewards across multiple scenes!",
                  },
                  {
                    icon: Zap,
                    title: "Continue Playing",
                    description:
                      "Lost a mission? Watch ads to continue or claim your accumulated XP and try again later!",
                  },
                ].map((item, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-card/80 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 bg-background">
                  <Waves className="w-4 h-4 mr-2" />
                  Making Waves
                </Badge>
                <h2 className="text-5xl font-bold mb-6 text-foreground">
                  See Your Impact in Real-Time
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Every fraction you sponsor, every vote you cast, creates
                  measurable environmental change. Track your personal impact
                  dashboard and watch as your actions help restore our planet!
                  🌊
                </p>
                <div className="space-y-4">
                  {IMPACT_FEATURES.map((item, index) => {
                    const IconComponent = {
                      Shield,
                      TrendingUp,
                      Globe,
                    }[item.icon];
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {IconComponent && (
                            <IconComponent className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Card className="p-8 bg-card backdrop-blur-xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  Live Impact Metrics
                </h3>
                <div className="space-y-6">
                  {IMPACT_METRICS.map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {metric.label}
                        </span>
                        <span className="text-primary font-bold text-xl">
                          {metric.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <Card className="p-6 sm:p-8 md:p-12 lg:p-16 text-center bg-gradient-to-br from-primary to-accent text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-violet-600/20 to-fuchsia-600/20"></div>
              <div className="relative z-10">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  Ready to Become an Eco-Warrior?
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 md:mb-10 opacity-95 max-w-2xl mx-auto px-2">
                  Join thousands of heroes cleaning the planet, earning rewards,
                  and making history. Your adventure starts now! 🚀
                </p>
                <Link to={ROUTES.APP_ROUND(currentRound?.id || 5)}>
                  <Button
                    size="lg"
                    className="gap-2 sm:gap-3 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 hover:scale-110 transition-transform shadow-[0_20px_60px_hsl(220_10%_40%_/_0.3)] bg-white text-secondary hover:bg-white/90"
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    Start Your Quest{" "}
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} className="w-8 h-8"></img>
                <span className="font-bold text-xl text-foreground">
                  {APP_CONFIG.NAME}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {APP_CONFIG.TAGLINE}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to={ROUTES.HOW_IT_WORKS}
                    className="hover:text-primary transition-colors"
                  >
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.LEADERBOARD}
                    className="hover:text-primary transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href={SOCIAL_LINKS.TWITTER}
                    className="hover:text-primary transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to={ROUTES.FAQ}
                    className="hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © 2025 {APP_CONFIG.NAME}. {APP_CONFIG.TAGLINE} 🌍
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Landing;
