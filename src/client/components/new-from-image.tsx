import { useRef, useState } from "preact/hooks";
import { ImagePlus } from "lucide-preact";
import type { NewDesign } from "../types";
import { buildImagePage, uploadImage } from "../lib/image-design";
import { Button } from "./ui/button";
import { FieldError } from "./ui/field";
import { Spinner } from "./ui/spinner";

/**
 * Starts a design from an image at 100%: the frame takes the image's own size
 * and the image keeps every pixel. Resizing the design afterwards fits the
 * whole image into the new frame (see Fit in resize.ts) instead of cropping it.
 */
export function NewFromImageButton({
  createFromTemplate,
  navigate,
  class: className,
}: {
  createFromTemplate: (design: NewDesign) => Promise<string | undefined>;
  navigate: (to: string) => void;
  class?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const page = await buildImagePage(await uploadImage(file));
      const id = await createFromTemplate({
        name: file.name.replace(/\.[^.]+$/, "") || "Image",
        canvas_json: page.canvas_json,
        width: page.width,
        height: page.height,
      });
      if (!id) throw new Error("Could not create the design.");
      navigate(`/design/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="flex flex-col gap-1.5">
      <Button variant="outline" class={className} disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Spinner /> : <ImagePlus />}
        {busy ? "Opening image…" : "New from image"}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        class="hidden"
        aria-label="Image to start a design from"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) void start(file);
        }}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
