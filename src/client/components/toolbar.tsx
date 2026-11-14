import { useState } from "preact/hooks";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Save,
  ChevronDown,
  Home,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  Images,
} from "lucide-preact";
import {
  useEditor,
  CANVAS_SIZES,
  MIN_CANVAS_SIDE,
  MAX_CANVAS_SIDE,
} from "../context";
import { cn } from "../lib/utils";
import { IconButton } from "./icon-button";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";
import { Switch } from "./ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Toolbar() {
  const {
    canvasWidth,
    canvasHeight,
    setCanvasSize,
    undoResize,
    canUndoResize,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    fitScale,
    zoomToFit,
    zoomIn,
    zoomOut,
    exportPNG,
    exportAllPNG,
    exportPDF,
    exporting,
    pages,
    saveDesign,
    saving,
    saveStatus,
    autoSave,
    setAutoSave,
    activeDesign,
    renameDesign,
    navigate,
  } = useEditor();

  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const currentSize = CANVAS_SIZES.find(
    (s) => s.width === canvasWidth && s.height === canvasHeight
  );
  const sizeLabel = currentSize ? currentSize.label : `${canvasWidth} x ${canvasHeight}`;

  const groups = CANVAS_SIZES.reduce<Record<string, typeof CANVAS_SIZES>>((acc, size) => {
    (acc[size.group] ||= []).push(size);
    return acc;
  }, {});

  const clampSide = (raw: string) => {
    const n = Math.round(Number(raw));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.min(Math.max(n, MIN_CANVAS_SIDE), MAX_CANVAS_SIDE);
  };

  const openSizeMenu = () => {
    setCustomWidth(String(canvasWidth));
    setCustomHeight(String(canvasHeight));
    setShowSizeDropdown(true);
  };

  const applyCustomSize = () => {
    const w = clampSide(customWidth);
    const h = clampSide(customHeight);
    if (w === null || h === null) return;
    setCustomWidth(String(w));
    setCustomHeight(String(h));
    setCanvasSize(w, h);
    setShowSizeDropdown(false);
  };

  const startRename = () => {
    if (!activeDesign) return;
    setNameValue(activeDesign.name);
    setEditingName(true);
  };

  const finishRename = () => {
    if (activeDesign && nameValue.trim()) {
      renameDesign(activeDesign.id, nameValue.trim());
    }
    setEditingName(false);
  };

  const designName = activeDesign?.name ?? "design";
  const pageIds = pages.map((p) => p.id);

  return (
    <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-card border-b shrink-0">
      {/* Left: Home + Design name + Canvas size */}
      <div class="flex items-center gap-2 min-w-0">
        <IconButton label="Back to designs" onClick={() => navigate("/")}>
          <Home />
        </IconButton>
        {activeDesign && (
          editingName ? (
            <Input
              class="h-7 w-40"
              aria-label="Design name"
              value={nameValue}
              onInput={(e) => setNameValue((e.target as HTMLInputElement).value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishRename();
                if (e.key === "Escape") setEditingName(false);
              }}
              autoFocus
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" class="font-semibold max-w-48" onDblClick={startRename}>
                  <span class="truncate">{activeDesign.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Double-click to rename</TooltipContent>
            </Tooltip>
          )
        )}

        <Popover
          open={showSizeDropdown}
          onOpenChange={(open) => (open ? openSizeMenu() : setShowSizeDropdown(false))}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" size="xs" class="text-muted-foreground">
              {sizeLabel}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-64 p-1">
            {Object.entries(groups).map(([group, sizes]) => (
              <div key={group} role="group" aria-label={group}>
                <div class="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                {sizes.map((s) => {
                  const current = s.width === canvasWidth && s.height === canvasHeight;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      aria-pressed={current}
                      class={cn(
                        "w-full flex items-baseline gap-2 text-left px-2 py-1.5 rounded-sm text-xs cursor-pointer outline-none transition-colors focus-visible:bg-accent",
                        current ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => {
                        setCanvasSize(s.width, s.height);
                        setShowSizeDropdown(false);
                      }}
                    >
                      <span class="font-medium">{s.label}</span>
                      <span class="text-muted-foreground">
                        {s.width} x {s.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            <Separator class="my-1" />
            <div class="flex flex-col gap-1.5 px-2 pt-1 pb-2">
              <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Custom</div>
              <div class="flex items-center gap-1.5">
                <Input
                  type="number"
                  aria-label="Custom width in pixels"
                  class="h-7 w-[72px]"
                  value={customWidth}
                  min={MIN_CANVAS_SIDE}
                  max={MAX_CANVAS_SIDE}
                  onInput={(e) => setCustomWidth((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCustomSize()}
                />
                <span class="text-muted-foreground text-xs">x</span>
                <Input
                  type="number"
                  aria-label="Custom height in pixels"
                  class="h-7 w-[72px]"
                  value={customHeight}
                  min={MIN_CANVAS_SIDE}
                  max={MAX_CANVAS_SIDE}
                  onInput={(e) => setCustomHeight((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCustomSize()}
                />
                <Button size="xs" variant="secondary" onClick={applyCustomSize}>
                  Resize
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {canUndoResize && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="xs" onClick={undoResize}>
                <RotateCcw />
                Undo resize
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore the previous size and layout</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Center: Undo / Redo */}
      <div class="flex items-center gap-0.5">
        <IconButton label="Undo (Cmd+Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 />
        </IconButton>
        <IconButton label="Redo (Cmd+Shift+Z)" onClick={redo} disabled={!canRedo}>
          <Redo2 />
        </IconButton>
      </div>

      {/* Right: Zoom + Export + Save */}
      <div class="flex items-center gap-1.5">
        <IconButton label="Zoom out" onClick={zoomOut}>
          <ZoomOut />
        </IconButton>
        <span class="text-[11px] text-muted-foreground font-mono w-10 text-center tabular-nums">
          {Math.round((zoom / (fitScale || 1)) * 100)}%
        </span>
        <IconButton label="Zoom in" onClick={zoomIn}>
          <ZoomIn />
        </IconButton>
        <IconButton label="Fit to screen" onClick={zoomToFit}>
          <Maximize />
        </IconButton>

        <Separator orientation="vertical" class="mx-1 !h-5" />

        <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exporting || !activeDesign}>
              {exporting ? <Spinner class="size-3.5" /> : <Download />}
              {exporting ? "Preparing…" : "Export"}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-60">
            <DropdownMenuItem class="items-start" onSelect={() => exportPDF(pageIds, designName)}>
              <FileText class="mt-0.5 text-primary" />
              <span class="flex flex-col gap-0.5">
                <span class="font-medium">Carousel PDF</span>
                <span class="text-[10px] text-muted-foreground">
                  All {pages.length} {pages.length === 1 ? "page" : "pages"}, ready for LinkedIn
                </span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem class="items-start" onSelect={() => exportPNG(designName)}>
              <ImageIcon class="mt-0.5" />
              <span class="flex flex-col gap-0.5">
                <span class="font-medium">This page</span>
                <span class="text-[10px] text-muted-foreground">PNG at 2x</span>
              </span>
            </DropdownMenuItem>
            {pages.length > 1 && (
              <DropdownMenuItem class="items-start" onSelect={() => exportAllPNG(pageIds, designName)}>
                <Images class="mt-0.5" />
                <span class="flex flex-col gap-0.5">
                  <span class="font-medium">All pages</span>
                  <span class="text-[10px] text-muted-foreground">{pages.length} separate PNGs at 2x</span>
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeDesign && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div class="flex items-center gap-1.5 px-1">
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={(checked) => {
                    setAutoSave(checked);
                    if (checked) void saveDesign();
                  }}
                />
                <Label for="auto-save" class="cursor-pointer whitespace-nowrap">Auto-save</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>Save changes automatically after a short pause</TooltipContent>
          </Tooltip>
        )}
        {activeDesign && (
          <span
            class={cn("text-[10px] whitespace-nowrap", saveStatus === "error" ? "text-destructive" : "text-muted-foreground")}
            aria-live="polite"
          >
            {saveStatus === "pending" ? "Unsaved changes" : saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : autoSave ? "All changes saved" : ""}
          </span>
        )}
        <Button size="sm" onClick={saveDesign} disabled={saving || !activeDesign}>
          {saving ? <Spinner class="size-3.5" /> : <Save />}
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
