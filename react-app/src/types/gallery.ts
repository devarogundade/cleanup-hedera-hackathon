/**
 * Gallery and Media Types
 */

export interface GalleryPhoto {
  id: number;
  image: string;
  caption: string;
  location: string;
  roundId: number;
  uploadedAt?: string;
  photographer?: string;
  tags?: string[];
}

export interface GalleryCollection {
  roundId: number;
  photos: GalleryPhoto[];
  totalPhotos: number;
}
