export const DEFAULT_ALBUM_EMOJI = "📷";

// Acepta cualquier cadena que contenga al menos un carácter emoji
export function isValidAlbumEmoji(input: string): boolean {
  return input.length > 0 && input.length <= 8 && /\p{Emoji}/u.test(input);
}
