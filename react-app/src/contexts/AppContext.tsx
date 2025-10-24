import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";
import useHashConnect from "@/hooks/useHashConnect";
import { useProfile } from "@/hooks/useProfile";
import { useLastestRound } from "@/hooks/useRounds";
import { Fraction, MintableFraction, RoundMetadata } from "@/types";

interface Achievement {
  title: string;
  description: string;
  xp: number;
}

interface AppContextType {
  // account
  isConnected: boolean;
  accountId: string;
  isLoading: boolean;
  setConnected: (state: boolean) => void;
  setAccountId: (value: string) => void;
  setLoading: (state: boolean) => void;

  // Round management
  lastestRound: RoundMetadata;
  currentRound: number;
  setCurrentRound: (round: number) => void;

  // Donation state
  mintableFractions: MintableFraction[];
  setMintableFractions: (value: MintableFraction[]) => void;
  totalPrice: number;
  setTotalPrice: (price: number) => void;
  selectedNGO: string | null;
  setSelectedNGO: (ngo: string | null) => void;

  // Currency
  currency: "HBAR" | "NGN" | "XP";
  setCurrency: (currency: "HBAR" | "NGN" | "XP") => void;

  // Achievement
  achievement: Achievement | null;
  setAchievement: (achievement: Achievement | null) => void;

  // Helpers
  isRoundEnded: boolean;
  resetDonationState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isConnected, setConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [mintableFractions, setMintableFractions] = useState<
    MintableFraction[]
  >([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedNGO, setSelectedNGO] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"HBAR" | "NGN" | "XP">("HBAR");
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { data: lastestRound } = useLastestRound();
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile(accountId);

  // Show profile setup dialog if user is connected but has no profile
  useEffect(() => {
    if (isConnected && accountId && !profileLoading && !profile) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isConnected, accountId, profile, profileLoading]);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    refetchProfile();
  };

  const resetDonationState = useCallback(() => {
    setMintableFractions([]);
    setTotalPrice(0);
    setSelectedNGO(null);
  }, []);

  const value: AppContextType = useMemo(() => ({
    isConnected,
    accountId,
    isLoading,
    setConnected,
    setAccountId,
    setLoading,
    lastestRound,
    currentRound,
    setCurrentRound,
    mintableFractions,
    setMintableFractions,
    totalPrice,
    setTotalPrice,
    selectedNGO,
    setSelectedNGO,
    currency,
    setCurrency,
    achievement,
    setAchievement,
    isRoundEnded: currentRound < lastestRound?.id,
    resetDonationState,
  }), [
    isConnected,
    accountId,
    isLoading,
    lastestRound,
    currentRound,
    mintableFractions,
    totalPrice,
    selectedNGO,
    currency,
    achievement,
    resetDonationState,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
      {isConnected && accountId && showProfileSetup && (
        <ProfileSetupDialog
          open={showProfileSetup}
          accountId={accountId}
          onComplete={handleProfileSetupComplete}
        />
      )}
    </AppContext.Provider>
  );
};
