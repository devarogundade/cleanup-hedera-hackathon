import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryImage {
  id: string;
  roundId: number;
  imageUrl: string;
  caption: string;
  location: string;
  displayOrder: number;
}

export const useGalleries = (roundId: number) => {
  return useQuery({
    queryKey: ["galleries", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("round_id", roundId)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return data.map((gallery) => ({
        id: gallery.id,
        roundId: gallery.round_id,
        imageUrl: gallery.image_url,
        caption: gallery.caption || "",
        location: gallery.location || "",
        displayOrder: gallery.display_order,
      })) as GalleryImage[];
    },
  });
};
