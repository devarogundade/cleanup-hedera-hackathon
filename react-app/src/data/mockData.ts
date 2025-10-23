/**
 * Data Layer - Mock Data
 * Sample data for development and testing
 */

export const LANDING_STATS = [
  { icon: "Target", value: "247", label: "Sites Cleaned", color: "text-primary" },
  { icon: "TrendingUp", value: "$2.4M", label: "Total Donations", color: "text-accent" },
  { icon: "Users", value: "15K+", label: "Active Heroes", color: "text-primary-glow" },
  { icon: "Trophy", value: "5.2K", label: "Achievements", color: "text-accent" },
] as const;

export const FEATURES = [
  {
    icon: "Zap",
    title: "Earn XP & Level Up",
    description: "Every donation earns you XP. Level up to unlock exclusive rewards and rare NFTs!",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: "Trophy",
    title: "Unlock Achievements",
    description: "Complete challenges, earn badges, and climb the leaderboard. Compete with eco-warriors worldwide!",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: "Globe",
    title: "Real-World Impact",
    description: "Track your environmental impact in real-time. See exactly how your donations create change!",
    gradient: "from-green-400 to-blue-500",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    icon: "MapPin",
    title: "Select Fractions",
    description: "Choose specific areas of trash sites you want to help clean",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    icon: "Heart",
    title: "Make Donation",
    description: "Donate and instantly earn XP + unique NFTs for your collection",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
  },
  {
    icon: "Users",
    title: "Vote for NGOs",
    description: "Use your voting power to choose which NGO handles the cleanup",
    color: "bg-gradient-to-br from-purple-500 to-indigo-500",
  },
  {
    icon: "Award",
    title: "Earn Rewards",
    description: "Level up, unlock achievements, and compete on the leaderboard",
    color: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
] as const;

export const IMPACT_METRICS = [
  { label: "Ocean Plastic Removed", value: "47.2 tons", percent: 75 },
  { label: "Coastline Restored", value: "12.4 km", percent: 62 },
  { label: "Marine Life Protected", value: "3,400+", percent: 88 },
] as const;

export const IMPACT_FEATURES = [
  { icon: "Shield", text: "Blockchain-verified transparency" },
  { icon: "TrendingUp", text: "Real-time progress tracking" },
  { icon: "Globe", text: "Global environmental network" },
] as const;
