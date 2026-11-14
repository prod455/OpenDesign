import { useState, useRef, useCallback } from "preact/hooks";
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Upload,
  Palette,
  LayoutGrid,
  Sparkles,
  SwatchBook,
} from "lucide-preact";
import { useEditor } from "../context";
import { TemplateCard } from "./template-card";
import { DesignList } from "./design-list";
import { BrandKitPanel } from "./brand-kit-panel";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "./ui/field";
import { Spinner } from "./ui/spinner";

type Section = "templates" | "brand" | "text" | "shapes" | "images" | "background" | "designs";

const SECTIONS: { key: Section; icon: typeof LayoutGrid; label: string }[] = [
  { key: "templates", icon: Sparkles, label: "Templates" },
  { key: "brand", icon: SwatchBook, label: "Brand" },
  { key: "shapes", icon: Square, label: "Elements" },
  { key: "text", icon: Type, label: "Text" },
  { key: "images", icon: Upload, label: "Uploads" },
  { key: "background", icon: Palette, label: "Bg" },
  { key: "designs", icon: LayoutGrid, label: "Designs" },
];

const SECTION_TITLES: Record<Section, string> = {
  templates: "Templates",
  brand: "Brand Kit",
  shapes: "Elements",
  text: "Text",
  images: "Uploads",
  background: "Background",
  designs: "Designs",
};

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const BG_COLORS = [
  "#1a1a2e", "#0f172a", "#18181b", "#1e1b4b",
  "#ffffff", "#f8fafc", "#fafaf9", "#fef3c7",
  "#2563eb", "#7c3aed", "#dc2626", "#059669",
  "#0891b2", "#d97706", "#e11d48", "#4f46e5",
];

export function LeftSidebar() {
  const { addText, addShape, addImage, setBackground, templates, loadTemplate } = useEditor();
  const [activeSection, setActiveSection] = useState<Section | null>("templates");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const handleSectionClick = (key: Section) => {
    setActiveSection((prev) => (prev === key ? null : key));
  };

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const form = new FormData();
          form.append("file", file);
          const resp = await fetch("/api/uploads", { method: "POST", body: form });
          const data = await resp.json();
          if (data.url) addImage(data.url);
        }
      } catch (e) {
        console.error("Upload failed:", e);
      } finally {
        setUploading(false);
      }
    },
    [addImage]
  );

  const handleBgUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const form = new FormData();
      form.append("file", files[0]);
      try {
        const resp = await fetch("/api/uploads", { method: "POST", body: form });
        const data = await resp.json();
        if (data.url) setBackground("image", data.url);
      } catch (e) {
        console.error("Bg upload failed:", e);
      }
    },
    [setBackground]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      handleImageUpload(e.dataTransfer?.files ?? null);
    },
    [handleImageUpload]
  );

  const isOpen = activeSection !== null;

  const optionCard =
    "w-full rounded-lg bg-card border cursor-pointer transition-all hover:border-primary hover:bg-accent outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
  const swatch =
    "w-full aspect-square rounded-md border cursor-pointer transition-all hover:scale-110 hover:border-primary outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]";

  return (
    <aside class="flex flex-row shrink-0">
      {/* Icon Rail */}
      <nav aria-label="Editor panels" class="w-[70px] bg-card border-r flex flex-col items-center pt-2 gap-0.5 shrink-0">
        {SECTIONS.map((s) => (
          <Button
            key={s.key}
            variant="ghost"
            aria-pressed={activeSection === s.key}
            class={cn(
              "flex-col gap-0.5 w-[56px] h-[56px] p-0 font-normal text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
              activeSection === s.key && "bg-accent text-accent-foreground"
            )}
            onClick={() => handleSectionClick(s.key)}
          >
            <s.icon />
            <span class="text-[10px] leading-tight">{s.label}</span>
          </Button>
        ))}
      </nav>

      {/* Content Panel */}
      <div
        class="bg-card border-r overflow-hidden transition-all duration-200 ease-in-out"
        style={{ width: isOpen ? "240px" : "0px" }}
      >
        <div class="w-[240px] h-full flex flex-col">
          {activeSection && (
            <>
              <div class="px-3 pt-3 pb-2 shrink-0">
                <h2 class="text-xs font-semibold uppercase tracking-wide m-0">
                  {SECTION_TITLES[activeSection]}
                </h2>
              </div>
              <div class="flex-1 overflow-y-auto px-3 pb-3">
                {activeSection === "templates" && (
                  <div class="flex flex-col gap-3">
                    {templates.length === 0 ? (
                      <FieldDescription>No templates yet.</FieldDescription>
                    ) : (
                      <>
                        <FieldDescription>Click a template to apply</FieldDescription>
                        <div class="grid grid-cols-2 gap-2">
                          {templates.map((t) => (
                            <TemplateCard key={t.id} template={t} onClick={() => loadTemplate(t)} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeSection === "brand" && <BrandKitPanel />}

                {activeSection === "text" && (
                  <div class="flex flex-col gap-2">
                    <FieldDescription>Click to add text</FieldDescription>
                    {([
                      ["heading", "text-lg font-bold", "Add a heading", "Montserrat Bold, 48px"],
                      ["subheading", "text-sm font-medium", "Add a subheading", "Inter Medium, 32px"],
                      ["body", "text-xs", "Add body text", "Inter Regular, 18px"],
                    ] as const).map(([preset, textClass, title, detail]) => (
                      <button
                        key={preset}
                        type="button"
                        class={cn(optionCard, "text-left p-3 flex flex-col gap-0.5 group")}
                        onClick={() => addText(preset)}
                      >
                        <span class={cn(textClass, "group-hover:text-accent-foreground transition-colors")}>{title}</span>
                        <span class="text-[10px] text-muted-foreground">{detail}</span>
                      </button>
                    ))}
                  </div>
                )}

                {activeSection === "shapes" && (
                  <div class="flex flex-col gap-2">
                    <FieldDescription>Click to add a shape</FieldDescription>
                    <div class="grid grid-cols-2 gap-2">
                      {[
                        { type: "rect" as const, icon: Square, label: "Rectangle" },
                        { type: "circle" as const, icon: Circle, label: "Circle" },
                        { type: "triangle" as const, icon: Triangle, label: "Triangle" },
                        { type: "line" as const, icon: Minus, label: "Line" },
                      ].map((s) => (
                        <button
                          key={s.type}
                          type="button"
                          class={cn(optionCard, "flex flex-col items-center gap-1.5 p-3 text-muted-foreground hover:text-accent-foreground")}
                          onClick={() => addShape(s.type)}
                        >
                          <s.icon class="size-6" />
                          <span class="text-[11px]">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "images" && (
                  <div class="flex flex-col gap-2">
                    <FieldDescription>Upload images to add to canvas</FieldDescription>
                    <button
                      type="button"
                      class="flex flex-col items-center gap-1 border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer transition-all bg-transparent hover:border-primary/50 hover:bg-accent outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      disabled={uploading}
                    >
                      {uploading ? <Spinner class="size-6 text-primary" /> : <Upload class="size-6 text-muted-foreground" />}
                      <span class="text-xs text-muted-foreground mt-1">
                        {uploading ? "Uploading…" : "Click or drag images here"}
                      </span>
                      <span class="text-[10px] text-muted-foreground/80">PNG, JPG, SVG, WebP</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      class="hidden"
                      onChange={(e) => handleImageUpload((e.target as HTMLInputElement).files)}
                    />
                  </div>
                )}

                {activeSection === "background" && (
                  <div class="flex flex-col gap-4">
                    <Field>
                      <FieldTitle>Solid colors</FieldTitle>
                      <div class="grid grid-cols-4 gap-1.5">
                        {BG_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            class={swatch}
                            style={{ background: c }}
                            aria-label={`Background ${c}`}
                            onClick={() => setBackground("color", c)}
                          />
                        ))}
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel for="bg-custom-color">Custom color</FieldLabel>
                      <input
                        id="bg-custom-color"
                        type="color"
                        class="w-full h-8 rounded-md border border-input cursor-pointer"
                        onChange={(e) => setBackground("color", (e.target as HTMLInputElement).value)}
                      />
                    </Field>

                    <Field>
                      <FieldTitle>Gradient presets</FieldTitle>
                      <div class="grid grid-cols-3 gap-1.5">
                        {GRADIENT_PRESETS.map((g, i) => (
                          <button
                            key={i}
                            type="button"
                            class={swatch}
                            style={{ background: g }}
                            aria-label={`Gradient preset ${i + 1}`}
                            onClick={() => {
                              const match = g.match(/#[0-9a-f]{6}/gi);
                              if (match) setBackground("color", match[0]);
                            }}
                          />
                        ))}
                      </div>
                    </Field>

                    <Field>
                      <FieldTitle>Background image</FieldTitle>
                      <Button variant="outline" size="sm" class="w-full" onClick={() => bgFileRef.current?.click()}>
                        <Upload />
                        Upload image
                      </Button>
                      <input
                        ref={bgFileRef}
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onChange={(e) => handleBgUpload((e.target as HTMLInputElement).files)}
                      />
                    </Field>
                  </div>
                )}

                {activeSection === "designs" && <DesignList />}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

