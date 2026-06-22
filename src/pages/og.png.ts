import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const defaultOgImage = join(process.cwd(), "public", "default-og.jpg");

export const GET: APIRoute = async () => {
  const image = await readFile(defaultOgImage);
  const pngBuffer = await sharp(image).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
