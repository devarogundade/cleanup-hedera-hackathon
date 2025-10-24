/**
 * Utility to convert between Fraction and MintableFraction types
 */
import { Fraction, MintableFraction } from "@/types/fraction";

/**
 * Convert a Fraction to MintableFraction
 * Note: Buffer generation happens during donation processing
 */
export const convertToMintableFraction = async (
  fraction: Omit<Fraction, "id">,
  imageUrl: string,
  gridConfig: { rows: number; cols: number }
): Promise<MintableFraction> => {
  // Calculate row and col from position
  const row = Math.floor((fraction.position - 1) / gridConfig.cols);
  const col = (fraction.position - 1) % gridConfig.cols;

  // Load the image and extract the fraction
  const buffer = await extractFractionBuffer(
    imageUrl,
    fraction.x,
    fraction.y,
    fraction.width,
    fraction.height
  );

  return {
    id: fraction.position, // Temporary ID matching position
    position: fraction.position,
    row,
    col,
    buffer,
  };
};

/**
 * Extract a fraction's image data as a Buffer
 */
async function extractFractionBuffer(
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Calculate pixel positions from percentages
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const pixelX = (x / 100) * imgWidth;
        const pixelY = (y / 100) * imgHeight;
        const pixelWidth = (width / 100) * imgWidth;
        const pixelHeight = (height / 100) * imgHeight;

        // Set canvas size to fraction size
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        // Draw the fraction portion of the image
        ctx.drawImage(
          img,
          pixelX,
          pixelY,
          pixelWidth,
          pixelHeight,
          0,
          0,
          pixelWidth,
          pixelHeight
        );

        // Convert canvas to blob then to buffer
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }

          blob.arrayBuffer().then((arrayBuffer) => {
            resolve(new Uint8Array(arrayBuffer));
          });
        }, "image/jpeg", 0.95);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}
