import { readFile } from "fs/promises";
import { join } from "path";

const ABS_PATH = join(process.cwd(), "public/assets/images/flourish.png");

/** Data URL of `public/assets/images/flourish.png` (for `ImageResponse` icons). */
export async function flourishPngDataUrl(): Promise<string> {
  const buf = await readFile(ABS_PATH);
  return `data:image/png;base64,${buf.toString("base64")}`;
}
