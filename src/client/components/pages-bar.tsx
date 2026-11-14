import { useState, useRef, useEffect } from "preact/hooks";
import * as fabric from "fabric";
import { Plus, MoreHorizontal, Copy, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-preact";
import { useEditor } from "../context";
import type { Page } from "../types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function PageThumb({ page, width, height }: { page: Page; width: number; height: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const prevJsonRef = useRef<string>("");

  useEffect(() => {
    if (page.canvas_json === prevJsonRef.current) return;
    prevJsonRef.current = page.canvas_json;

    const el = document.createElement("canvas");
    const sc = new fabric.StaticCanvas(el, { width, height });
    try {
      const parsed = JSON.parse(page.canvas_json);
      sc.loadFromJSON(parsed).then(() => {
        sc.renderAll();
        const multiplier = Math.min(200 / width, 200 / height, 1);
        setSrc(sc.toDataURL({ format: "png", multiplier }));
        sc.dispose();
      });
    } catch {
      sc.dispose();
    }
  }, [page.canvas_json, width, height]);

  return src ? (
    <img src={src} class="rounded w-full h-full object-cover" alt={page.title} />
  ) : (
    <Skeleton class="w-full h-full rounded" />
  );
}

export function PagesBar() {
  const {
    pages, activePageId, addPage, duplicatePage, deletePage, renamePage,
    switchToPage, setActiveCanvas, canvasWidth, canvasHeight,
  } = useEditor();
  const [expanded, setExpanded] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const pendingRenameRef = useRef<{ id: string; title: string } | null>(null);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const startRename = (pageId: string, currentTitle: string) => {
    setRenamingId(pageId);
    setRenameValue(currentTitle);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      renamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handlePageClick = (pageId: string) => {
    setActiveCanvas(pageId);
    switchToPage(pageId);
    const pageEl = document.querySelector(`[data-page-id="${pageId}"]`);
    if (pageEl) pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (pages.length === 0) return null;

  return (
    <div class="bg-card border-t shrink-0">
      {/* Collapsed bar — always visible */}
      <button
        type="button"
        aria-expanded={expanded}
        class="w-full flex items-center justify-between px-4 py-1.5 bg-transparent cursor-pointer hover:bg-muted transition-colors outline-none focus-visible:bg-muted"
        onClick={() => setExpanded(!expanded)}
      >
        <span class="text-[11px] text-muted-foreground font-medium">Pages ({pages.length})</span>
        {expanded ? (
          <ChevronDown class="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp class="size-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded thumbnail strip */}
      {expanded && (
        <div class="flex items-center gap-2 px-4 py-2 border-t overflow-x-auto">
          {pages.map((page) => {
            const isActive = page.id === activePageId;
            return (
              <div key={page.id} class="relative flex-shrink-0 group flex flex-col gap-0.5" style={{ width: 88 }}>
                <div
                  class={cn(
                    "relative cursor-pointer border-2 rounded-lg p-1 transition-all bg-card",
                    isActive ? "border-primary shadow-sm" : "border-border hover:border-input"
                  )}
                  onClick={() => handlePageClick(page.id)}
                >
                  <div class="rounded w-full overflow-hidden" style={{ height: 50 }}>
                    <PageThumb page={page} width={canvasWidth} height={canvasHeight} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        aria-label={`Actions for ${page.title}`}
                        class="absolute top-1 right-1 size-5 bg-card/90 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      class="min-w-[140px]"
                      // Rename starts only once the menu has closed: while it is open the
                      // menu holds focus and would take it back from the name input.
                      onCloseAutoFocus={(e) => {
                        const pending = pendingRenameRef.current;
                        if (!pending) return;
                        pendingRenameRef.current = null;
                        e.preventDefault();
                        startRename(pending.id, pending.title);
                      }}
                    >
                      <DropdownMenuItem onSelect={() => (pendingRenameRef.current = { id: page.id, title: page.title })}>
                        <Pencil />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => duplicatePage(page.id)}>
                        <Copy />
                        Duplicate
                      </DropdownMenuItem>
                      {pages.length > 1 && (
                        <DropdownMenuItem variant="destructive" onSelect={() => deletePage(page.id)}>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div class="text-center">
                  {renamingId === page.id ? (
                    <Input
                      ref={renameRef}
                      aria-label="Page name"
                      class="h-5 text-center text-[10px] px-1"
                      value={renameValue}
                      onInput={(e) => setRenameValue((e.target as HTMLInputElement).value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                  ) : (
                    <span class={cn("text-[10px] truncate block", isActive ? "font-medium" : "text-muted-foreground")}>
                      {page.title}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Add page"
                class="flex-shrink-0 flex items-center justify-center w-10 h-[62px] rounded-lg border-2 border-dashed border-input bg-transparent cursor-pointer text-muted-foreground transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                onClick={() => addPage()}
              >
                <Plus class="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add page</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
