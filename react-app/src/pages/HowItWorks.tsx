import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Heart, Users, Award, Wallet, Trophy, CheckCircle, Zap, Clock, Gift, ArrowRight, Shield, Globe, Target, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/data/constants";
const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [{
    icon: Wallet,
    number: "01",
    title: "Connect Your Wallet",
    description: "Connect your Hedera wallet to get started. Compatible with HashPack and other Hedera wallets - setup takes less than 2 minutes.",
    color: "from-blue-500 to-cyan-500",
    highlights: ["Secure connection", "Quick setup", "Multiple wallet support"]
  }, {
    icon: MapPin,
    number: "02",
    title: "Select Cleanup Zones",
    description: "Browse active cleanup rounds and choose the zones you want to support. View real locations on an interactive map.",
    color: "from-green-500 to-emerald-500",
    highlights: ["Interactive maps", "Ocean cleanups", "Tree planting zones"]
  }, {
    icon: Heart,
    number: "03",
    title: "Make Your Donation",
    description: "Select fractions and complete your donation using HBAR. All transactions are instant and transparent on the blockchain.",
    color: "from-purple-500 to-violet-500",
    highlights: ["Instant confirmation", "Low fees", "100% transparent"]
  }, {
    icon: Users,
    number: "04",
    title: "Vote for NGOs",
    description: "Cast your vote to decide which NGO will execute the cleanup. Your voice matters in directing environmental action.",
    color: "from-amber-500 to-orange-500",
    highlights: ["Verified NGOs", "Real-time results", "On-chain voting"]
  }, {
    icon: Trophy,
    number: "05",
    title: "Receive NFT Rewards",
    description: "Get unique NFTs for each fraction sponsored, plus earn XP and climb the leaderboard.",
    color: "from-pink-500 to-rose-500",
    highlights: ["Collectible NFTs", "XP & levels", "Exclusive badges"]
  }, {
    icon: Award,
    number: "06",
    title: "Track Your Impact",
    description: "Monitor your personal dashboard to see the real-world impact you've made. Watch as cleanup teams restore the environment.",
    color: "from-cyan-500 to-blue-500",
    highlights: ["Impact metrics", "Photo updates", "Transparent tracking"]
  }];
  const features = [{
    icon: Zap,
    title: "Instant Transactions",
    description: "Powered by Hedera's high-speed network with 3-5 second finality",
    color: "from-yellow-500 to-amber-500"
  }, {
    icon: Shield,
    title: "Secure & Transparent",
    description: "All donations and NGO actions are recorded on the blockchain",
    color: "from-blue-500 to-indigo-500"
  }, {
    icon: Gift,
    title: "Gamified Rewards",
    description: "Earn XP, level up, and collect unique NFTs as you make an impact",
    color: "from-pink-500 to-purple-500"
  }, {
    icon: Globe,
    title: "Real-World Impact",
    description: "Each round targets specific locations for focused environmental change",
    color: "from-green-500 to-teal-500"
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 hover:bg-accent">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Link to={ROUTES.APP_ROUND(5)}>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-24 animate-fade-in">
            <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/20">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              Step by Step Guide
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent px-4">
              How It Works
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Making environmental impact has never been easier. Follow these simple steps 
              to start cleaning the planet and earning rewards.
            </p>
          </div>

          {/* Steps Section */}
          <div className="space-y-16 sm:space-y-24 mb-20 sm:mb-32">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Connection Line for non-last steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-primary/30 to-transparent -translate-x-1/2" />
                  )}
                  
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
                    {/* Icon Side */}
                    <div className="flex-1 flex justify-center">
                      <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                        <div className={`relative bg-gradient-to-br ${step.color} rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl transform group-hover:scale-105 transition-transform`}>
                          <step.icon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
                          <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-background border-2 sm:border-4 border-primary rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                            <span className="text-lg sm:text-2xl font-bold text-primary">{step.number}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {step.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gameplay Section */}
          <div className="mb-20 sm:mb-32">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/20">
                <Trophy className="w-4 h-4 mr-2 text-primary" />
                Play & Earn
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Eco-Fighter Game
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fight for the planet in an endless mission-based game
              </p>
            </div>
            
            <Card className="max-w-4xl mx-auto p-8 sm:p-12 bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 shadow-xl">
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Mission-Based Gameplay</h3>
                        <p className="text-sm text-muted-foreground">Play through endless scenes with unique missions. Each scene challenges you to collect trash or plant trees faster than the AI opponent.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Earn XP & Level Up</h3>
                        <p className="text-sm text-muted-foreground">Win missions to earn XP and accumulate rewards. Only winners get XP - lose and you'll need to continue or claim your current XP.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    How to Play
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Use <strong>arrow keys</strong> or <strong>WASD</strong> to move your character</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Collect <strong>trash items</strong> or plant <strong>trees</strong> depending on mission type</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Beat the AI opponent by collecting more items before time runs out</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Win to progress to next scene and earn XP, or watch ads to continue after losing</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Unlock Requirement</p>
                      <p className="text-sm text-muted-foreground">Make at least one donation to unlock the Eco-Fighter game and start earning XP through gameplay!</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mb-20 sm:mb-32">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Platform Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to make a real difference
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            <div className="relative px-6 py-12 sm:p-16 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Ready to Make an Impact?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of contributors making a real difference in ocean cleanup and reforestation efforts.
              </p>
              <Link to={ROUTES.APP_ROUND(5)}>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl text-base sm:text-lg px-8 py-6">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default HowItWorks;