import { useState } from "preact/hooks";
import { Trash2, Edit3, Plus } from "lucide-preact";
import { useEditor } from "../context";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function DesignList() {
  const { designs, activeDesign, createDesign, loadDesign, deleteDesign, renameDesign, navigate } =
    useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div class="flex flex-col gap-2">
      <Button
        size="sm"
        class="w-full"
        onClick={async () => {
          const id = await createDesign();
          if (id) navigate(`/design/${id}`);
        }}
      >
        <Plus />
        New Design
      </Button>

      {designs.length === 0 && (
        <p class="m-0 text-muted-foreground text-[11px] text-center py-4">No saved designs yet</p>
      )}

      {designs.map((d) => (
        <div
          key={d.id}
          class={cn(
            "flex items-center gap-1 px-2.5 py-2 rounded-lg border transition-all group cursor-pointer",
            activeDesign?.id === d.id ? "border-primary bg-accent" : "bg-card hover:border-input hover:bg-muted"
          )}
          onClick={() => {
            navigate(`/design/${d.id}`);
            loadDesign(d.id);
          }}
        >
          {editingId === d.id ? (
            <Input
              class="h-7 flex-1"
              aria-label="Design name"
              value={editName}
              onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishRename();
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div class="flex-1 min-w-0">
              <span class="text-xs font-medium truncate block">{d.name}</span>
              <span class="text-[10px] text-muted-foreground">
                {d.width}x{d.height} &middot; {new Date(d.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}
          <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Rename ${d.name}`}
              onClick={(e) => {
                e.stopPropagation();
                startRename(d.id, d.name);
              }}
            >
              <Edit3 />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              class="hover:text-destructive"
              aria-label={`Delete ${d.name}`}
              onClick={(e) => {
                e.stopPropagation();
                deleteDesign(d.id);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
