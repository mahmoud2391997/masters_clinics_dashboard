export function getImageUrl(image) {
    if (!image)
        return "";
    if (/^https?:\/\//.test(image))
        return image;
    if (image.startsWith("/public") || image.startsWith("/uploads")) {
        console.log(`Image URL: http://localhost:3000${image}`);
        return `http://localhost:3000${image}`;
    }
    return `http://localhost:3000/public/uploads/${image}`;
}
;
