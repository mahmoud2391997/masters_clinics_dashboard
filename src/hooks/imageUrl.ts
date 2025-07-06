export function getImageUrl(image: string): string {
  if (!image) return "";

  if (/^https?:\/\//.test(image)) return image;

  if (image.startsWith("/public") || image.startsWith("/uploads")) {
    console.log(`Image URL: https://www.ss.mastersclinics.com${image}`);
    
    return `https://www.ss.mastersclinics.com${image}`;
  }

  return `https://www.ss.mastersclinics.com/public/uploads/${image}`;
};