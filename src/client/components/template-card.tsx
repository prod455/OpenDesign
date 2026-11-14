import { useState, useEffect, useRef } from "preact/hooks";
import * as fabric from "fabric";
import type { Template } from "../types";
import { Skeleton } from "./ui/skeleton";

interface Props {
  template: Template;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current) return;
    rendered.current = true;

    const el = document.createElement("canvas");
    const tempCanvas = new fabric.StaticCanvas(el, {
      width: template.width,
      height: template.height,
    });

    try {
      const parsed = JSON.parse(template.canvas_json);
      tempCanvas.loadFromJSON(parsed).then(() => {
        tempCanvas.renderAll();
        // Render at 400px wide for crisp retina thumbnails
        const targetPx = 400;
        const multiplier = Math.min(targetPx / template.width, targetPx / template.height, 1);
        const dataUrl = tempCanvas.toDataURL({
          format: "png",
          multiplier,
        });
        setPreview(dataUrl);
        tempCanvas.dispose();
      });
    } catch {
      tempCanvas.dispose();
    }
  }, [template]);

  return (
    <button
      type="button"
      class="group relative self-start flex flex-col bg-card text-card-foreground border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-md p-0 text-left outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      onClick={onClick}
    >
      {/* Preview area */}
      <div
        class="w-full flex items-center justify-center bg-muted overflow-hidden"
        style={{ aspectRatio: `${template.width} / ${template.height}` }}
      >
        {preview ? (
          <img src={preview} alt={template.name} class="w-full h-full object-contain" />
        ) : (
          <Skeleton class="w-full h-full rounded-none" />
        )}
      </div>
      {/* Label */}
      <div class="w-full px-2 py-1.5 border-t flex flex-col gap-0.5">
        <span class="text-[10px] font-medium truncate block">{template.name}</span>
        <span class="text-[9px] text-muted-foreground">
          {template.width}&times;{template.height}
        </span>
      </div>
    </button>
  );
}
