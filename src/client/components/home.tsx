import { useState, useCallback } from "preact/hooks";
import { Plus, Trash2, Edit3, Sparkles, Image as ImageIcon } from "lucide-preact";
import type { Design, Template } from "../types";
import { TemplateCard } from "./template-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";

interface HomeProps {
  designs: Design[];
  templates: Template[];
  navigate: (to: string) => void;
  createDesign: () => Promise<string | undefined>;
  deleteDesign: (id: string) => Promise<void>;
  renameDesign: (id: string, name: string) => Promise<void>;
  createFromTemplate: (template: Template) => Promise<string | undefined>;
}

export function Home({
  designs,
  templates,
  navigate,
  createDesign,
  deleteDesign,
  renameDesign,
  createFromTemplate,
}: HomeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = useCallback(async () => {
    const id = await createDesign();
    if (id) navigate(`/design/${id}`);
  }, [createDesign, navigate]);

  const handleTemplateClick = useCallback(
    async (t: Template) => {
      const id = await createFromTemplate(t);
      if (id) navigate(`/design/${id}`);
    },
    [createFromTemplate, navigate]
  );

  const startRename = (id: string, name: string, e: Event) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div class="h-full overflow-y-auto bg-background">
      {/* Header */}
      <header class="bg-card border-b">
        <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-lg font-semibold tracking-tight m-0">My Designs</h1>
            <p class="text-xs text-muted-foreground m-0">
              {designs.length} design{designs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus />
            New Design
          </Button>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-8">
        {/* Templates section */}
        {templates.length > 0 && (
          <section class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <Sparkles class="size-3.5 text-primary" />
              <h2 class="text-sm font-semibold m-0">Start from a template</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} onClick={() => handleTemplateClick(t)} />
              ))}
            </div>
          </section>
        )}

        {/* Designs grid */}
        {designs.length === 0 ? (
          <Empty class="py-16">
            <EmptyHeader>
              <EmptyMedia>
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>No designs yet</EmptyTitle>
              <EmptyDescription>Create your first design to get started.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={handleCreate}>
                <Plus />
                Create Design
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <section class="flex flex-col gap-3">
            <h2 class="text-sm font-semibold m-0">Recent designs</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((d) => (
                <Card
                  key={d.id}
                  class="overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-md group"
                  onClick={() => navigate(`/design/${d.id}`)}
                >
                  {/* Preview area */}
                  <div class="aspect-[4/3] bg-muted flex items-center justify-center">
                    {d.thumbnail_url ? (
                      <img src={d.thumbnail_url} alt={d.name} class="w-full h-full object-cover" />
                    ) : (
                      <div class="text-muted-foreground text-[10px] font-medium">
                        {d.width} x {d.height}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent class="border-t">
                    {editingId === d.id ? (
                      <Input
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
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0 flex-1 flex flex-col gap-1">
                          <CardTitle>{d.name}</CardTitle>
                          <CardDescription>
                            {d.width} x {d.height} &middot; {new Date(d.updated_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Rename ${d.name}`}
                            onClick={(e) => startRename(d.id, d.name, e)}
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
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
