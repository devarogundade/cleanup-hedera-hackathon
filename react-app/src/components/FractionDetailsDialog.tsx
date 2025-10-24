import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { Fraction, RoundMetadata } from "@/types";

interface FractionDetailsDialogProps {
  fraction: Omit<Fraction, "id"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonate?: () => void;
  onRemove?: () => void;
  isSelected?: boolean;
  roundMetadata: RoundMetadata;
}

const FractionDetailsDialog = ({
  fraction,
  open,
  onOpenChange,
  onDonate,
  onRemove,
  isSelected,
  roundMetadata,
}: FractionDetailsDialogProps) => {
  const { playSound } = useSettings();
  const [nftPreview, setNftPreview] = useState<string>("");

  const isTreePlanting = roundMetadata?.type === "tree-planting";

  const trashSiteImage = roundMetadata?.imageUrl;

  useEffect(() => {
    if (fraction && open) {
      // Create cropped NFT preview
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match fraction dimensions
        const canvasSize = 300; // Output size
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Calculate crop dimensions (8x8 grid)
        const cols = Math.sqrt(roundMetadata.totalFractions);
        const rows = Math.sqrt(roundMetadata.totalFractions);
        const fractionWidth = img.width / cols;
        const fractionHeight = img.height / rows;

        const row = Math.floor(fraction.position / cols);
        const col = fraction.position % cols;

        const cropX = col * fractionWidth;
        const cropY = row * fractionHeight;

        // Draw the cropped section
        ctx.drawImage(
          img,
          cropX,
          cropY,
          fractionWidth,
          fractionHeight, // Source
          0,
          0,
          canvasSize,
          canvasSize // Destination
        );

        // Add a border/frame
        ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, canvasSize, canvasSize);

        setNftPreview(canvas.toDataURL());
      };
      img.src = trashSiteImage;
    }
  }, [fraction, open, trashSiteImage, roundMetadata]);

  if (!fraction) return null;

  const row = Math.floor(
    fraction.position / Math.sqrt(roundMetadata.totalFractions)
  );
  const col = fraction.position % Math.sqrt(roundMetadata.totalFractions);
  const area = (fraction.width * fraction.height).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Fraction #{fraction.position}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* NFT Preview */}
          {nftPreview ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/30">
              <img
                src={nftPreview}
                alt={`NFT #${fraction.position}`}
                className="w-full"
              />
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                #{fraction.position}
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square bg-secondary rounded-lg animate-pulse" />
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="font-bold">
                R{row + 1}, C{col + 1}
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Area</p>
              <p className="font-bold">{area}%</p>
            </div>
          </div>

          {/* Price */}
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">Price</span>
              <span className="text-xl font-bold text-gradient">
                {fraction.price.toFixed(3)} HBAR
              </span>
            </div>
          </div>

          {/* Token ID for donated */}
          {fraction.donated && fraction.tokenId && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Token ID</p>
              <p className="font-mono text-sm font-bold">{fraction.tokenId}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!fraction.donated ? (
            <div className="flex gap-2">
              {isSelected && onRemove ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      playSound("click");
                      onRemove();
                      onOpenChange(false);
                    }}
                  >
                    Remove from Donation
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary border-0 shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] h-12"
                    onClick={() => onOpenChange(false)}
                  >
                    Keep Selected
                  </Button>
                </>
              ) : onDonate ? (
                <Button
                  className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] transition-all hover:scale-[1.02]"
                  onClick={() => {
                    playSound("success");
                    onDonate();
                    onOpenChange(false);
                  }}
                >
                  {isTreePlanting
                    ? "✨ Add to Tree Planting Fund"
                    : "✨ Add to Donation"}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">✓ Already claimed</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FractionDetailsDialog;
