import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  ZoomIn,
  ZoomOut,
  Move,
  Clock,
  FileText,
  Trophy,
} from "lucide-react";
import FractionDetailsDialog from "./FractionDetailsDialog";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { RoundMetadata } from "@/types/round";
import { useFractions } from "@/hooks/useFractions";
import type { Fraction, MintableFraction } from "@/types/fraction";

interface TrashSiteVisualizationProps {
  roundMetadata: RoundMetadata;
}

const TrashSiteVisualization = ({
  roundMetadata,
}: TrashSiteVisualizationProps) => {
  const { playSound } = useSettings();
  const {
    currentRound: round,
    isRoundEnded: roundEnded,
    setMintableFractions: setContextSelectedFractions,
    setTotalPrice,
  } = useApp();
  const { data: fractionsData, isLoading: fractionsLoading } = useFractions(
    round,
    roundMetadata.totalFractions,
    roundMetadata?.unitValue
  );

  const [mintableFractions, setMintableFractions] = useState<
    MintableFraction[]
  >([]);
  const [dialogFraction, setDialogFraction] = useState<Omit<
    Fraction,
    "id"
  > | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isTreePlanting = roundMetadata.type === "tree-planting";

  const handleFractionClick = (fraction: Omit<Fraction, "id">) => {
    if (roundEnded) {
      toast({
        title: "Round has ended",
        description:
          "This cleanup round has ended. You cannot select fractions from past rounds.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }
    playSound("select");
    setDialogFraction(fraction);
    setDialogOpen(true);
  };

  const handleZoomIn = () => {
    playSound("click");
    const newZoom = Math.min(zoom + 0.2, 3);
    setZoom(newZoom);
    toast({
      title: "Zoom updated",
      description: `Zoom level: ${newZoom.toFixed(1)}x`,
    });
  };

  const handleZoomOut = () => {
    playSound("click");
    const newZoom = Math.max(zoom - 0.2, 0.5);
    setZoom(newZoom);
    toast({
      title: "Zoom updated",
      description: `Zoom level: ${newZoom.toFixed(1)}x`,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAddToDonation = (mintable: MintableFraction) => {
    if (!dialogFraction) return;

    // Add to selection
    const newSelection = [...mintableFractions, mintable];
    toast({
      title: "Fraction added! ✨",
      description: `Fraction #${dialogFraction.position} added to your donation selection`,
    });
    playSound("success");

    setMintableFractions(newSelection);

    setContextSelectedFractions(newSelection);
    setTotalPrice(newSelection.length * roundMetadata.unitValue);
  };

  const handleRemoveFromDonation = () => {
    if (!dialogFraction) return;

    // Remove from selection
    const newSelection = mintableFractions.filter(
      (m) => m.position !== dialogFraction.position
    );
    toast({
      title: "Fraction removed",
      description: `Fraction #${dialogFraction.position} removed from selection`,
    });
    playSound("click");

    setMintableFractions(newSelection);

    setContextSelectedFractions(newSelection);
    setTotalPrice(newSelection.length * roundMetadata?.unitValue);
  };

  return (
    <>
      <Card className="trash-site-visualization border-0 p-4 overflow-hidden select-none">
        {roundEnded && (
          <div className="mb-4 p-3 bg-secondary rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Round {round} - {isTreePlanting ? "Tree Planting" : "Cleanup"}{" "}
                Completed ✓
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-mono">
                  {new Date(roundMetadata.creationTime).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-muted-foreground">Ended:</span>
                <span className="font-mono">
                  {roundMetadata.endedTime
                    ? new Date(roundMetadata.endedTime).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <FileText className="w-3 h-3" />
                <span className="text-muted-foreground">Contract:</span>
                <span className="font-mono text-xs">
                  {roundMetadata.contractId}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {isTreePlanting ? "Tree Planting" : "Cleanup"} Zone #
                  {40 + round} - Round {round}
                </h3>
                {!roundEnded && (
                  <Badge
                    variant="default"
                    className="bg-primary border-0 text-xs sm:text-sm"
                  >
                    🔥 Active
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-2">
                {isTreePlanting
                  ? "Select areas to fund tree planting. Each fraction represents a reforestation section. 🌲"
                  : "Select areas to donate. Each fraction represents a cleanup section. 🗺️"}
              </p>
            </div>

            {/* Zoom Controls - Desktop */}
            <div className="hidden lg:flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:scale-110 transition-all"
                onClick={handleZoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:scale-110 transition-all"
                onClick={handleZoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all"
              >
                <Map className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1">
              <span className="whitespace-nowrap">📍 Location:</span>
              <span className="font-medium">
                {roundMetadata.location.coordinates}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium">{roundMetadata.location.name}</span>
            </p>
            {roundMetadata.location.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {roundMetadata.location.description}
              </p>
            )}
          </div>

          {/* Zoom Controls - Mobile/Tablet */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all flex-shrink-0"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4 mr-1.5" />
              <span className="text-xs">Zoom In</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all flex-shrink-0"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4 mr-1.5" />
              <span className="text-xs">Zoom Out</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all flex-shrink-0"
            >
              <Map className="w-4 h-4 mr-1.5" />
              <span className="text-xs">View on Map</span>
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full aspect-square bg-gradient-to-br from-muted to-secondary rounded-lg overflow-hidden shadow-card"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Background Image - synced with SVG transform */}
          <div
            className="absolute inset-0 transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
                pan.y / zoom
              }px)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={roundMetadata?.imageUrl}
              alt={`${roundMetadata.location.name} aerial view`}
              className="w-full h-full object-cover opacity-40"
              style={{ pointerEvents: "none" }}
            />
          </div>

          {/* SVG Trash Site Visualization */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full transition-transform duration-200"
            style={{
              display: "block",
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
                pan.y / zoom
              }px)`,
            }}
          >
            {/* Background pattern to simulate trash site */}
            <defs>
              <pattern
                id="trash-pattern"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="2"
                  cy="2"
                  r="0.5"
                  fill="hsl(var(--primary))"
                  opacity="0.1"
                />
                <circle
                  cx="7"
                  cy="5"
                  r="0.3"
                  fill="hsl(var(--accent))"
                  opacity="0.1"
                />
                <circle
                  cx="5"
                  cy="8"
                  r="0.4"
                  fill="hsl(var(--primary-glow))"
                  opacity="0.1"
                />
              </pattern>
            </defs>

            <rect width="100" height="100" fill="url(#trash-pattern)" />

            {/* Render fractions */}
            {fractionsData?.map((fraction) => {
              const isSelected = mintableFractions
                .map((m) => m.position)
                .includes(fraction.position);
              const isDonated = fraction.donated;
              const isNotAllowed = fraction.notAllowed;

              return (
                <g key={fraction.position}>
                  <rect
                    x={fraction.x}
                    y={fraction.y}
                    width={fraction.width}
                    height={fraction.height}
                    fill={
                      isNotAllowed
                        ? "hsl(var(--destructive) / 0.2)"
                        : isDonated
                        ? "hsl(var(--muted))"
                        : isSelected
                        ? "hsl(var(--primary))"
                        : "transparent"
                    }
                    stroke={
                      isNotAllowed
                        ? "hsl(var(--destructive))"
                        : isSelected
                        ? "hsl(var(--primary))"
                        : isDonated
                        ? "hsl(var(--border))"
                        : "hsl(var(--border))"
                    }
                    strokeWidth={
                      isNotAllowed ? "0.4" : isSelected ? "0.5" : "0.3"
                    }
                    opacity={
                      isNotAllowed
                        ? 0.5
                        : isDonated
                        ? 0.3
                        : isSelected
                        ? 0.7
                        : 0.2
                    }
                    className={`transition-all duration-200 ${
                      isNotAllowed || isDonated
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:opacity-50 hover:stroke-primary"
                    }`}
                    onClick={() =>
                      !isNotAllowed && handleFractionClick(fraction)
                    }
                  />
                  {isDonated && (
                    <text
                      x={fraction.x + fraction.width / 2}
                      y={fraction.y + fraction.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="3"
                      fill="hsl(var(--foreground))"
                      opacity="0.5"
                    >
                      ✓
                    </text>
                  )}
                  {isNotAllowed && (
                    <g>
                      {/* X mark for not allowed fractions */}
                      <line
                        x1={fraction.x + fraction.width * 0.3}
                        y1={fraction.y + fraction.height * 0.3}
                        x2={fraction.x + fraction.width * 0.7}
                        y2={fraction.y + fraction.height * 0.7}
                        stroke="hsl(var(--destructive))"
                        strokeWidth="0.5"
                        opacity="0.8"
                      />
                      <line
                        x1={fraction.x + fraction.width * 0.7}
                        y1={fraction.y + fraction.height * 0.3}
                        x2={fraction.x + fraction.width * 0.3}
                        y2={fraction.y + fraction.height * 0.7}
                        stroke="hsl(var(--destructive))"
                        strokeWidth="0.5"
                        opacity="0.8"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Move className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                Drag to pan • Zoom: {zoom.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 sm:w-4 h-3 sm:h-4 bg-primary/60 rounded"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 sm:w-4 h-3 sm:h-4 bg-muted/30 rounded"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Donated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 sm:w-4 h-3 sm:h-4 bg-destructive/20 border border-destructive rounded relative">
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-destructive font-bold">
                  ✕
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Not Allowed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 sm:w-4 h-3 sm:h-4 border border-border rounded"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Available
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selected Fractions
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gradient">
              {mintableFractions.length}
            </p>
          </div>
        </div>
      </Card>

      <FractionDetailsDialog
        roundMetadata={roundMetadata}
        fraction={dialogFraction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDonate={handleAddToDonation}
        onRemove={handleRemoveFromDonation}
        isSelected={
          dialogFraction ? mintableFractions.includes(dialogFraction) : false
        }
      />
    </>
  );
};

export default TrashSiteVisualization;
