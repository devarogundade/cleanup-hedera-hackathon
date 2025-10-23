import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeliveryInfo, Reward } from "@/types/reward";
import { Gift, Package, Sparkles } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/hooks/use-toast";

interface RewardClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  onClaim: (rewardId: number, deliveryInfo?: DeliveryInfo) => void;
}

const RewardClaimDialog = ({
  open,
  onOpenChange,
  reward,
  onClaim,
}: RewardClaimDialogProps) => {
  const { playSound } = useSettings();
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  if (!reward) return null;

  // Determine if reward is physical (awards, trophies, physical badges, etc.)
  const isPhysical =
    reward.title.toLowerCase().includes("award") ||
    reward.title.toLowerCase().includes("trophy") ||
    (reward.type === "badge" && !reward.value.toLowerCase().includes("nft"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isPhysical) {
      // Validate delivery info
      const requiredFields = Object.values(deliveryInfo);
      if (requiredFields.some((field) => !field.trim())) {
        toast({
          title: "Missing Information",
          description: "Please fill in all delivery details",
          variant: "destructive",
        });
        return;
      }
    }

    playSound("success");
    onClaim(reward.id, isPhysical ? deliveryInfo : undefined);
    onOpenChange(false);

    toast({
      title: "Reward Claimed!",
      description: isPhysical
        ? "Your reward will be shipped to the provided address"
        : "Your reward has been added to your account",
    });

    // Reset form
    setDeliveryInfo({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isPhysical ? (
              <Package className="w-5 h-5 text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            Claim Your Reward
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reward Details */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{reward.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {reward.description}
                </p>
                <p className="text-sm font-medium text-primary mt-2">
                  {reward.value}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isPhysical ? (
              <>
                <div className="border rounded-lg p-3 bg-muted/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    This is a physical reward. Please provide your delivery
                    address.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={deliveryInfo.fullName}
                        onChange={(e) =>
                          setDeliveryInfo({
                            ...deliveryInfo,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={deliveryInfo.email}
                        onChange={(e) =>
                          setDeliveryInfo({
                            ...deliveryInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={deliveryInfo.phone}
                        onChange={(e) =>
                          setDeliveryInfo({
                            ...deliveryInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={deliveryInfo.address}
                        onChange={(e) =>
                          setDeliveryInfo({
                            ...deliveryInfo,
                            address: e.target.value,
                          })
                        }
                        placeholder="123 Main Street, Apt 4B"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={deliveryInfo.city}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              city: e.target.value,
                            })
                          }
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={deliveryInfo.postalCode}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={deliveryInfo.country}
                        onChange={(e) =>
                          setDeliveryInfo({
                            ...deliveryInfo,
                            country: e.target.value,
                          })
                        }
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-4 text-center bg-muted/50">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  This is a digital reward that will be instantly added to your
                  account.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isPhysical ? "Submit & Claim" : "Claim Reward"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardClaimDialog;
