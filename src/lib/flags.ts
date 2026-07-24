/** Single source of truth for flag image URLs (flagcdn.com, public domain). */

export type FlagWidth = 40 | 80 | 160 | 1280;

export function flagUrl(iso2: string, width: FlagWidth = 80): string {
  return `https://flagcdn.com/w${width}/${iso2}.png`;
}
