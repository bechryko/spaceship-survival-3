/** - `lineHeight`: Distance between lines in px. Defaults to the font's natural line height.
    - `centerVertically`: Treat `y` as the vertical centre of the whole block instead of where the first line goes. */
export interface MultilineOptions {
  lineHeight?: number;
  centerVertically?: boolean;
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}

function naturalLineHeight(ctx: CanvasRenderingContext2D): number {
  const m = ctx.measureText('Mg');
  return m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: MultilineOptions,
  draw: (line: string, x: number, y: number) => void
): void {
  const lines = splitLines(text);
  const lineHeight = options.lineHeight ?? naturalLineHeight(ctx);
  const startY = options.centerVertically ? y - ((lines.length - 1) * lineHeight) / 2 : y;

  lines.forEach((line, i) => draw(line, x, startY + i * lineHeight));
}

export function fillMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: MultilineOptions = {}
): void {
  drawLines(ctx, text, x, y, options, (line, lx, ly) => ctx.fillText(line, lx, ly));
}

export function strokeMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: MultilineOptions = {}
): void {
  drawLines(ctx, text, x, y, options, (line, lx, ly) => ctx.strokeText(line, lx, ly));
}

/** Size of the whole block: the widest line, and the line height times the number of lines. */
export function measureMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: Pick<MultilineOptions, 'lineHeight'> = {}
): { width: number; height: number } {
  const lines = splitLines(text);
  const lineHeight = options.lineHeight ?? naturalLineHeight(ctx);

  return {
    width: Math.max(...lines.map(line => ctx.measureText(line).width)),
    height: lines.length * lineHeight
  };
}
