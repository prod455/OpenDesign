import * as fabric from "fabric";
import { MAX_CANVAS_SIDE } from "../context";
import { fitToFrame, type Fit } from "../resize";

/** Sends a file to the uploads bucket as it is: no resampling, no recompression. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const resp = await fetch("/api/uploads", { method: "POST", body: form });
  const data = (await resp.json()) as { url?: string; error?: string };
  if (!resp.ok || !data.url) throw new Error(data.error || "Upload failed");
  return data.url;
}

// The fill behind a contained image is only ever seen blurred, so it is drawn
// from a thumbnail: a few KB in the saved design instead of a second full image.
const FILL_SIDE = 96;

function blurredThumbnail(source: HTMLImageElement): string {
  const ratio = Math.min(FILL_SIDE / source.naturalWidth, FILL_SIDE / source.naturalHeight, 1);
  const el = document.createElement("canvas");
  el.width = Math.max(1, Math.round(source.naturalWidth * ratio));
  el.height = Math.max(1, Math.round(source.naturalHeight * ratio));
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  // Safari ignores ctx.filter; the thumbnail's low resolution still reads as a blur.
  ctx.filter = "blur(3px) brightness(0.92)";
  // Drawn past the edges so the blur does not fade to transparent at the border.
  ctx.drawImage(source, -6, -6, el.width + 12, el.height + 12);
  return el.toDataURL("image/jpeg", 0.8);
}

export interface ImagePage {
  width: number;
  height: number;
  canvas_json: string;
  /** True when the image was larger than MAX_CANVAS_SIDE and the frame was scaled to fit it. */
  scaledDown: boolean;
}

/**
 * A page whose frame is the image's own size, with the image at 100% — one
 * image pixel per design pixel. Behind it sits a blurred copy that covers the
 * frame, invisible until a resize changes the aspect ratio; then the image is
 * contained (nothing cut off) and the blur fills the bands instead of bare
 * canvas.
 */
export async function buildImagePage(url: string): Promise<ImagePage> {
  const image = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  const natural = { width: image.width || 1, height: image.height || 1 };
  const shrink = Math.min(1, MAX_CANVAS_SIDE / Math.max(natural.width, natural.height));
  const frame = {
    width: Math.round(natural.width * shrink),
    height: Math.round(natural.height * shrink),
  };

  const fill = await fabric.FabricImage.fromURL(blurredThumbnail(image.getElement() as HTMLImageElement));
  fill.set({ selectable: false, evented: false });
  (fill as { fit?: Fit }).fit = "cover";
  fitToFrame(fill, "cover", frame);

  (image as { fit?: Fit }).fit = "contain";
  fitToFrame(image, "contain", frame);

  const canvas = new fabric.StaticCanvas(undefined, frame);
  try {
    canvas.add(fill, image);
    return {
      ...frame,
      canvas_json: JSON.stringify(canvas.toJSON()),
      scaledDown: shrink < 1,
    };
  } finally {
    canvas.dispose();
  }
}
