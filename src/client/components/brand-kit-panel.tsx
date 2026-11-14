import { useRef, useState } from "preact/hooks";
import { Upload, Plus, Trash2, Download, Wand2, X, AlertCircle } from "lucide-preact";
import { useEditor } from "../context";
import { FontPicker } from "./font-picker";
import { exportKit, importKit } from "../lib/kit-transfer";
import { cn } from "../lib/utils";
import { IconButton } from "./icon-button";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "./ui/field";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function BrandKitPanel() {
  const {
    brandKits,
    activeBrandKit,
    activeBrandKitId,
    setActiveBrandKitId,
    createBrandKit,
    updateBrandKit,
    deleteBrandKit,
    applyBrandKit,
    addImage,
    selectedObject,
    updateSelectedObject,
    setBackground,
    customFonts,
    importFont,
  } = useEditor();

  // A swatch click means "make the thing I have selected this colour"; with
  // nothing selected the only sensible target is the page background.
  const applyBrandColor = (color: string) => {
    if (selectedObject) updateSelectedObject({ fill: color });
    else setBackground("color", color);
  };

  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  // Holds the label of the async operation in flight, or null. One state rather
  // than a boolean so the indicator says which of upload / export / import is running.
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files?.length || !activeBrandKit) return;
    setBusy("Uploading…");
    try {
      const form = new FormData();
      form.append("file", files[0]);
      const resp = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await resp.json();
      if (data.url) {
        await updateBrandKit(activeBrandKit.id, { logos: [...activeBrandKit.logos, data.url] });
      }
    } catch (e) {
      console.error("Logo upload failed:", e);
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async () => {
    if (!activeBrandKit) return;
    setError(null);
    setBusy("Exporting…");
    try {
      const { json, missing } = await exportKit(activeBrandKit, customFonts);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${activeBrandKit.name.replace(/[^\w-]+/g, "-").toLowerCase()}.brandkit.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      if (missing > 0) setError(`Exported, but ${missing} asset(s) could not be read.`);
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy("Importing…");
    try {
      const result = await importKit(await files[0].text(), importFont);
      if (!result) {
        setError("That file is not an OpenDesign brand kit.");
        return;
      }
      await createBrandKit(result.kit);
      if (result.missing > 0) setError(`Imported, but ${result.missing} asset(s) could not be saved.`);
    } finally {
      setBusy(null);
    }
  };

  const tile =
    "w-full aspect-square rounded-md border cursor-pointer transition-all outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]";
  const addTile = cn(
    tile,
    "border-dashed border-input bg-transparent flex items-center justify-center text-muted-foreground hover:border-primary hover:text-accent-foreground hover:bg-accent"
  );
  const removeBadge =
    "absolute -top-1 -right-1 size-4 rounded-full bg-foreground text-background cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center";

  return (
    <div class="flex flex-col gap-4">
      {/* Kit selector */}
      <div class="flex gap-1.5">
        <NativeSelect
          value={activeBrandKitId ?? ""}
          onChange={(e) => setActiveBrandKitId((e.target as HTMLSelectElement).value || null)}
          aria-label="Active brand kit"
        >
          {brandKits.length === 0 && <option value="">No brand kit yet</option>}
          {brandKits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </NativeSelect>
        <IconButton label="New brand kit" variant="outline" class="shrink-0" onClick={() => createBrandKit()}>
          <Plus />
        </IconButton>
      </div>

      {!activeBrandKit ? (
        <FieldDescription class="leading-relaxed">
          A brand kit holds the colors, fonts and logos you reuse on every design. Create one, then
          apply it to any design in a click.
        </FieldDescription>
      ) : (
        <>
          {/* Name */}
          <Field>
            <FieldLabel for="kit-name">Kit name</FieldLabel>
            <Input
              id="kit-name"
              type="text"
              value={activeBrandKit.name}
              onChange={(e) =>
                updateBrandKit(activeBrandKit.id, {
                  name: (e.target as HTMLInputElement).value || "My Brand",
                })
              }
            />
          </Field>

          {/* Colors */}
          <Field>
            <FieldTitle>
              <span>
                Brand colors <span class="font-normal text-muted-foreground/70">— click to apply to selection</span>
              </span>
            </FieldTitle>
            <div class="grid grid-cols-5 gap-1.5">
              {activeBrandKit.colors.map((color, i) => (
                <div key={`${color}-${i}`} class="relative group">
                  <button
                    type="button"
                    class={cn(tile, "hover:scale-110 hover:border-primary")}
                    style={{ background: color }}
                    title={color}
                    aria-label={`Brand color ${color}`}
                    onClick={() => applyBrandColor(color)}
                  />
                  <button
                    type="button"
                    class={removeBadge}
                    title={`Remove ${color}`}
                    aria-label={`Remove brand color ${color}`}
                    onClick={() =>
                      updateBrandKit(activeBrandKit.id, {
                        colors: activeBrandKit.colors.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <X class="size-2.5" />
                  </button>
                </div>
              ))}
              {activeBrandKit.colors.length < 24 && (
                <label class={addTile}>
                  <Plus class="size-3.5" />
                  <input
                    type="color"
                    class="sr-only"
                    aria-label="Add brand color"
                    onChange={(e) =>
                      updateBrandKit(activeBrandKit.id, {
                        colors: [...activeBrandKit.colors, (e.target as HTMLInputElement).value],
                      })
                    }
                  />
                </label>
              )}
            </div>
          </Field>

          {/* Fonts */}
          <div class="flex flex-col gap-3">
            <FontPicker
              label="Heading font"
              value={activeBrandKit.heading_font}
              onChange={(heading_font) => updateBrandKit(activeBrandKit.id, { heading_font })}
            />
            <FontPicker
              label="Body font"
              value={activeBrandKit.body_font}
              onChange={(body_font) => updateBrandKit(activeBrandKit.id, { body_font })}
            />
          </div>

          {/* Logos */}
          <Field>
            <FieldTitle>
              <span>
                Logos <span class="font-normal text-muted-foreground/70">— click to place</span>
              </span>
            </FieldTitle>
            <div class="grid grid-cols-3 gap-1.5">
              {activeBrandKit.logos.map((url, i) => (
                <div key={url} class="relative group">
                  <button
                    type="button"
                    class={cn(
                      tile,
                      "p-1 hover:border-primary bg-[repeating-conic-gradient(var(--muted)_0%_25%,var(--card)_0%_50%)] bg-[length:12px_12px]"
                    )}
                    onClick={() => addImage(url)}
                    title="Add logo to canvas"
                    aria-label="Add logo to canvas"
                  >
                    <img src={url} alt="" class="w-full h-full object-contain" />
                  </button>
                  <button
                    type="button"
                    class={removeBadge}
                    aria-label="Remove logo"
                    onClick={() =>
                      updateBrandKit(activeBrandKit.id, {
                        logos: activeBrandKit.logos.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <X class="size-2.5" />
                  </button>
                </div>
              ))}
              {activeBrandKit.logos.length < 12 && (
                <button
                  type="button"
                  class={addTile}
                  onClick={() => logoInputRef.current?.click()}
                  aria-label="Upload logo"
                >
                  <Upload class="size-3.5" />
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={(e) => handleLogoUpload((e.target as HTMLInputElement).files)}
            />
          </Field>

          {/* Apply: the panel's one primary action */}
          <Tooltip>
            <TooltipTrigger asChild>
              {/* A span so the tooltip still explains why the button is disabled. */}
              <span class="block">
                <Button
                  size="sm"
                  class="w-full"
                  onClick={() => applyBrandKit(activeBrandKit)}
                  disabled={activeBrandKit.colors.length === 0}
                >
                  <Wand2 />
                  Apply to this page
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {activeBrandKit.colors.length === 0
                ? "Add at least one brand color first"
                : "Apply brand fonts and colors to this page"}
            </TooltipContent>
          </Tooltip>

          {/* Portability */}
          <Separator />
          <div class="flex flex-col gap-2">
            <FieldDescription class="leading-relaxed">
              Your kit is a plain JSON file. Take it to another OpenDesign install, or hand it to a
              client.
            </FieldDescription>
            <div class="flex gap-1.5">
              <Button variant="outline" size="xs" class="flex-1" onClick={handleExport}>
                <Download />
                Export
              </Button>
              <Button variant="outline" size="xs" class="flex-1" onClick={() => importInputRef.current?.click()}>
                <Upload />
                Import
              </Button>
              <IconButton
                label="Delete this brand kit"
                variant="outline"
                size="icon-xs"
                class="shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                onClick={() => deleteBrandKit(activeBrandKit.id)}
              >
                <Trash2 />
              </IconButton>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              class="hidden"
              onChange={(e) => handleImport((e.target as HTMLInputElement).files)}
            />
            {busy && (
              <p class="m-0 flex items-center gap-1.5 text-[11px] text-muted-foreground" role="status">
                <Spinner class="size-3" />
                {busy}
              </p>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  );
}
