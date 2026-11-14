import { useState, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Copy,
  BringToFront,
  MoveUp,
  MoveDown,
  SendToBack,
} from "lucide-preact";
import * as fabric from "fabric";
import { useEditor } from "../context";
import { PRIMARY_HEX } from "../lib/theme";
import { FontPicker } from "./font-picker";
import { IconButton } from "./icon-button";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "./ui/field";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Toggle } from "./ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/**
 * The active kit's colours, offered wherever a colour is chosen. This is what
 * "on brand" means day to day: the brand palette is one click away at the
 * moment of picking, not a page you have to remember to visit.
 */
function BrandSwatches({ onPick }: { onPick: (color: string) => void }) {
  const { activeBrandKit } = useEditor();
  if (!activeBrandKit || activeBrandKit.colors.length === 0) return null;
  return (
    <div class="flex flex-wrap gap-1">
      {activeBrandKit.colors.map((color, i) => (
        <button
          key={`${color}-${i}`}
          type="button"
          class="size-5 rounded border cursor-pointer transition-all hover:scale-110 hover:border-primary outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          style={{ background: color }}
          title={`${activeBrandKit.name} — ${color}`}
          aria-label={`Use brand color ${color}`}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
  );
}

/**
 * Names an object so `/api/designs/:id/fields` publishes it and
 * `/api/designs/:id/fill` can write to it. Committed on blur rather than per
 * keystroke, so naming a field costs one undo step instead of one per letter.
 */
function FieldNameInput({
  object,
  onCommit,
}: {
  object: fabric.FabricObject;
  onCommit: (name: string) => void;
}) {
  const saved = ((object as any).fieldName as string) || "";
  const [draft, setDraft] = useState(saved);

  // Re-seed when the selection moves to a different object.
  useEffect(() => setDraft(saved), [object]);

  const commit = () => {
    const next = draft.trim();
    if (next !== saved) onCommit(next);
    setDraft(next);
  };

  return (
    <Field>
      <FieldLabel for="field-name">Field name</FieldLabel>
      <Input
        id="field-name"
        type="text"
        placeholder="e.g. headline"
        class="font-mono"
        value={draft}
        onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <FieldDescription>
        {saved
          ? "Fillable through the design's /fill endpoint."
          : "Name it to fill it from data or an agent."}
      </FieldDescription>
    </Field>
  );
}

/** A colour picker beside its hex value, which can also be typed. */
function ColorField({ id, label, value, onChange, children }: {
  id: string;
  label: string;
  value: string;
  onChange: (color: string) => void;
  children?: ComponentChildren;
}) {
  return (
    <Field>
      <FieldLabel for={id}>{label}</FieldLabel>
      <div class="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          class="size-8 rounded-md border border-input cursor-pointer shrink-0"
          value={value}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        />
        {children ?? (
          <Input
            id={id}
            type="text"
            class="flex-1 font-mono"
            value={value}
            onInput={(e) => onChange((e.target as HTMLInputElement).value)}
          />
        )}
      </div>
    </Field>
  );
}

/** A Slider with its label and current value on one line. */
function SliderField({ label, display, value, min, max, step, onChange }: {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field>
      <FieldTitle>
        {label}
        <span class="font-mono font-normal tabular-nums">{display}</span>
      </FieldTitle>
      <Slider aria-label={label} value={value} min={min} max={max} step={step} onValueChange={onChange} />
    </Field>
  );
}

export function RightSidebar() {
  const { selectedObject, updateSelectedObject, changeLayer, deleteSelected, canvas, setBackground, canvasWidth, canvasHeight } =
    useEditor();

  const isText = selectedObject instanceof fabric.Textbox || selectedObject instanceof fabric.IText;
  const isImage = selectedObject instanceof fabric.FabricImage;
  const isShape = selectedObject && !isText && !isImage;
  const objects = canvas?.getObjects() ?? [];
  const layerIndex = selectedObject ? objects.indexOf(selectedObject) : -1;
  const layerCount = objects.length;

  if (!selectedObject) {
    return (
      <aside class="w-[280px] bg-card border-l flex flex-col shrink-0">
        <div class="h-12 px-4 border-b flex items-center">
          <h2 class="m-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canvas</h2>
        </div>
        <div class="p-4 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-muted-foreground">Dimensions</span>
            <span class="text-[11px] font-mono tabular-nums">{canvasWidth} x {canvasHeight}</span>
          </div>
          <Field>
            <FieldLabel for="canvas-bg">Background color</FieldLabel>
            <input
              id="canvas-bg"
              type="color"
              class="w-full h-8 rounded-md border border-input cursor-pointer"
              onChange={(e) => setBackground("color", (e.target as HTMLInputElement).value)}
            />
            <BrandSwatches onPick={(color) => setBackground("color", color)} />
          </Field>
        </div>
      </aside>
    );
  }

  const o = selectedObject as any;
  const isBold = o.fontWeight === "700" || o.fontWeight === "bold";

  return (
    <aside class="w-[280px] bg-card border-l flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div class="h-12 px-4 border-b flex items-center justify-between">
        <h2 class="m-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {isText ? "Text" : isImage ? "Image" : "Shape"}
        </h2>
        <div class="flex gap-0.5">
          <IconButton
            label="Duplicate"
            size="icon-xs"
            onClick={async () => {
              if (!canvas || !selectedObject) return;
              const clone = await selectedObject.clone();
              clone.set({ left: (selectedObject.left || 0) + 20, top: (selectedObject.top || 0) + 20 });
              canvas.add(clone);
              canvas.setActiveObject(clone);
            }}
          >
            <Copy />
          </IconButton>
          <IconButton
            label="Delete"
            size="icon-xs"
            class="hover:text-destructive hover:bg-destructive/10"
            onClick={deleteSelected}
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-4">
        {/* ── Template field ────────────────────────────────────────── */}
        {(isText || isImage) && (
          <FieldNameInput
            object={selectedObject}
            onCommit={(fieldName) => updateSelectedObject({ fieldName })}
          />
        )}

        <Field>
          <FieldTitle>Layer order</FieldTitle>
          <div class="flex gap-1">
            {([
              ["front", BringToFront, "To front", layerIndex === layerCount - 1],
              ["forward", MoveUp, "Forward", layerIndex === layerCount - 1],
              ["backward", MoveDown, "Backward", layerIndex <= 0],
              ["back", SendToBack, "To back", layerIndex <= 0],
            ] as const).map(([action, Icon, label, disabled]) => (
              <Tooltip key={action}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    class="flex-1 text-muted-foreground"
                    aria-label={label}
                    disabled={layerIndex < 0 || disabled}
                    onClick={() => changeLayer(action)}
                  >
                    <Icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </Field>

        {/* ── Text properties ───────────────────────────────────────── */}
        {isText && (
          <>
            <FontPicker
              label="Font family"
              value={(selectedObject as fabric.IText).fontFamily || "Inter"}
              onChange={(fontFamily) => updateSelectedObject({ fontFamily })}
            />

            <Field>
              <FieldLabel for="font-size">Font size</FieldLabel>
              <Input
                id="font-size"
                type="number"
                value={o.fontSize || 18}
                onInput={(e) =>
                  updateSelectedObject({
                    fontSize: parseInt((e.target as HTMLInputElement).value) || 18,
                  })
                }
              />
            </Field>

            <Field>
              <FieldTitle>Style</FieldTitle>
              <div class="flex gap-1">
                <Toggle
                  variant="outline"
                  aria-label="Bold"
                  pressed={isBold}
                  onPressedChange={() => updateSelectedObject({ fontWeight: isBold ? "400" : "700" })}
                >
                  <Bold />
                </Toggle>
                <Toggle
                  variant="outline"
                  aria-label="Italic"
                  pressed={o.fontStyle === "italic"}
                  onPressedChange={() =>
                    updateSelectedObject({ fontStyle: o.fontStyle === "italic" ? "normal" : "italic" })
                  }
                >
                  <Italic />
                </Toggle>
                <Toggle
                  variant="outline"
                  aria-label="Underline"
                  pressed={!!o.underline}
                  onPressedChange={() => updateSelectedObject({ underline: !o.underline })}
                >
                  <Underline />
                </Toggle>
              </div>
            </Field>

            <Field>
              <FieldTitle>Alignment</FieldTitle>
              <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Alignment"
                value={o.textAlign || ""}
                onValueChange={(align: string) => align && updateSelectedObject({ textAlign: align })}
              >
                {[
                  { align: "left", icon: AlignLeft, label: "Align left" },
                  { align: "center", icon: AlignCenter, label: "Align center" },
                  { align: "right", icon: AlignRight, label: "Align right" },
                ].map(({ align, icon: Icon, label }) => (
                  <ToggleGroupItem key={align} value={align} aria-label={label} class="px-3">
                    <Icon />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <ColorField
              id="text-color"
              label="Color"
              value={(o.fill as string) || "#ffffff"}
              onChange={(fill) => updateSelectedObject({ fill })}
            />
            <BrandSwatches onPick={(color) => updateSelectedObject({ fill: color })} />

            <SliderField
              label="Line height"
              display={(o.lineHeight || 1.2).toFixed(1)}
              value={o.lineHeight || 1.2}
              min={0.8}
              max={3}
              step={0.1}
              onChange={(lineHeight) => updateSelectedObject({ lineHeight })}
            />

            <SliderField
              label="Letter spacing"
              display={String(o.charSpacing || 0)}
              value={o.charSpacing || 0}
              min={-200}
              max={800}
              step={10}
              onChange={(charSpacing) => updateSelectedObject({ charSpacing })}
            />
          </>
        )}

        {/* ── Shape properties ──────────────────────────────────────── */}
        {isShape && (
          <>
            <ColorField
              id="shape-fill"
              label="Fill color"
              value={(selectedObject.fill as string) || PRIMARY_HEX}
              onChange={(fill) => updateSelectedObject({ fill })}
            />
            <BrandSwatches onPick={(color) => updateSelectedObject({ fill: color })} />

            <ColorField
              id="shape-stroke-width"
              label="Stroke color"
              value={(selectedObject.stroke as string) || "#000000"}
              onChange={(stroke) => updateSelectedObject({ stroke })}
            >
              <Input
                id="shape-stroke-width"
                type="number"
                class="w-16"
                aria-label="Stroke width"
                value={selectedObject.strokeWidth || 0}
                min={0}
                placeholder="Width"
                onInput={(e) =>
                  updateSelectedObject({
                    strokeWidth: parseInt((e.target as HTMLInputElement).value) || 0,
                  })
                }
              />
            </ColorField>

            {selectedObject instanceof fabric.Rect && (
              <SliderField
                label="Border radius"
                display={`${o.rx || 0}px`}
                value={o.rx || 0}
                min={0}
                max={100}
                step={1}
                onChange={(val) => updateSelectedObject({ rx: val, ry: val })}
              />
            )}
          </>
        )}

        {/* ── Image properties ──────────────────────────────────────── */}
        {isImage && (
          <Field>
            <FieldTitle>Flip</FieldTitle>
            <div class="flex gap-1">
              <Toggle
                variant="outline"
                aria-label="Flip horizontally"
                pressed={!!selectedObject.flipX}
                onPressedChange={() => updateSelectedObject({ flipX: !selectedObject.flipX })}
              >
                <FlipHorizontal />
              </Toggle>
              <Toggle
                variant="outline"
                aria-label="Flip vertically"
                pressed={!!selectedObject.flipY}
                onPressedChange={() => updateSelectedObject({ flipY: !selectedObject.flipY })}
              >
                <FlipVertical />
              </Toggle>
            </div>
          </Field>
        )}

        {/* ── Common: Opacity ───────────────────────────────────────── */}
        <SliderField
          label="Opacity"
          display={`${Math.round((selectedObject.opacity ?? 1) * 100)}%`}
          value={selectedObject.opacity ?? 1}
          min={0}
          max={1}
          step={0.01}
          onChange={(opacity) => updateSelectedObject({ opacity })}
        />
      </div>
    </aside>
  );
}
