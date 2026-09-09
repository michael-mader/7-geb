/**
 * Utility to process and compress images client-side before sending.
 * Compresses images to max 1280px dimension and ~0.8 JPEG quality
 * to ensure fast rendering and safe localStorage persistence.
 */
export function compressImageFile(file: File, maxDimension = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Die ausgewählte Datei ist kein Bild.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Fehler beim Laden des Bildes.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down if either dimension exceeds maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if canvas context unavailable
            resolve(reader.result as string);
            return;
          }

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback to original reader result
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
