/** '#rrggbb' to 'rgba(r, g, b, alpha)' */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function darken(hex: string, amount = 0.15): string {
  const { r, g, b } = toRgb(hex);

  const darkenChannel = (value: number) => Math.round(value * (1 - amount));

  return `#${[r, g, b].map(channel => darkenChannel(channel).toString(16).padStart(2, '0')).join('')}`;
}

export function lighten(hex: string, amount = 0.15): string {
  const { r, g, b } = toRgb(hex);

  const lightenChannel = (value: number) => Math.round(value + (255 - value) * amount);

  return `#${[r, g, b].map(channel => lightenChannel(channel).toString(16).padStart(2, '0')).join('')}`;
}

function toRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const num = parseInt(normalized, 16);

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return { r, g, b };
}
