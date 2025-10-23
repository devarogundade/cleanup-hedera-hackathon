import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useApp } from "@/contexts/AppContext";
import { useGalleries } from "@/hooks/useGalleries";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";

const RoundGallery = () => {
  const { currentRound: round } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const { data: photos = [], isLoading } = useGalleries(round);

  const handlePrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + photos.length) % photos.length
      );
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % photos.length);
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-0 p-3 sm:p-4 md:p-6 transition-all">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                    Round {round} Gallery
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Photos from this cleanup round
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {isLoading ? (
              <LoadingState variant="card" count={3} />
            ) : photos.length === 0 ? (
              <EmptyState
                icon={Camera}
                title="No photos yet"
                description="Gallery photos will appear here once the round is completed"
                className="mt-4"
              />
            ) : (
              <Carousel className="mt-4 sm:mt-6 w-full">
                <CarouselContent>
                  {photos.map((photo, index) => (
                  <CarouselItem
                    key={photo.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div
                      className="group relative overflow-hidden rounded-xl bg-secondary border-2 border-transparent hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <p className="text-sm font-semibold mb-1 text-foreground">
                          {photo.caption}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{photo.location}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        #{photo.id}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            )}
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Image Viewer Dialog */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={() => setSelectedImageIndex(null)}
      >
        <DialogContent className="max-w-6xl h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedImageIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background w-12 h-12"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <div className="flex flex-col items-center justify-center max-h-full p-8">
                <img
                  src={photos[selectedImageIndex].imageUrl}
                  alt={photos[selectedImageIndex].caption}
                  className="max-w-full max-h-[calc(90vh-200px)] object-contain rounded-lg shadow-2xl"
                />
                <div className="mt-6 text-center max-w-2xl">
                  <p className="text-lg font-semibold mb-2">
                    {photos[selectedImageIndex].caption}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{photos[selectedImageIndex].location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Image {selectedImageIndex + 1} of {photos.length}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background w-12 h-12"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoundGallery;
