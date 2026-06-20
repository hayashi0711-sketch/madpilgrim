import type { SpotCategory } from "@/types/mad-pilgrim";

const categoryIconFile: Partial<Record<SpotCategory, string>> = {
  drama: "DRAMA-sm.png",
  movie: "MOVIE-sm.png",
  anime: "ANIME-sm.png",
  manga: "MANGA-sm.png",
  mv: "MUSIC_VIDEO-sm.png"
};

// Small (240px-wide) pre-resized badges, used at 16-28px display height across the UI.
// Keeps payload tiny instead of shipping the ~1MB full-resolution category artwork for thumbnails.
export function categoryIconSrc(category: SpotCategory): string | null {
  const file = categoryIconFile[category];
  return file ? `/images/categories/${file}` : null;
}
