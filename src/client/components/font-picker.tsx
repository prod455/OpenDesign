import { useRef, useState } from "preact/hooks";
import { ChevronDown, ChevronUp } from "lucide-preact";
import { useEditor } from "../context";
import { FONT_FAMILIES } from "../fonts";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Field, FieldError, FieldTitle } from "./ui/field";
import { Spinner } from "./ui/spinner";

export function FontPicker({ value, onChange, label }: {
  value: string;
  onChange: (family: string) => void;
  label: string;
}) {
  const { customFonts, importFont } = useEditor();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `font-options-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const fonts = [
    ...FONT_FAMILIES.map((family) => ({ family, name: family })),
    ...customFonts,
  ];

  const current = fonts.find((font) => font.family === value)?.name ?? `${value} (unavailable)`;

  return <Field>
    <FieldTitle>{label}</FieldTitle>
    <Button
      variant="outline"
      size="sm"
      aria-label={`${label}: ${current}`}
      aria-expanded={open}
      aria-controls={id}
      class="w-full justify-between bg-card font-normal"
      onClick={() => setOpen(!open)}
    >
      <span class="truncate" style={{ fontFamily: value }}>{current}</span>
      {open ? <ChevronUp class="text-muted-foreground" /> : <ChevronDown class="text-muted-foreground" />}
    </Button>
    {open && <div id={id} role="group" aria-label="Available fonts" class="max-h-56 overflow-y-auto bg-popover text-popover-foreground border rounded-md shadow-md p-1">
      {fonts.map((font) => (
        <button
          key={font.family}
          type="button"
          aria-pressed={value === font.family}
          class={cn(
            "w-full flex items-center justify-between gap-3 text-left text-xs px-2 py-1.5 rounded-sm cursor-pointer outline-none focus-visible:bg-accent",
            value === font.family ? "bg-accent text-accent-foreground" : "bg-transparent hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => { onChange(font.family); setOpen(false); }}
        >
          <span class="truncate" style={{ fontFamily: font.family }}>{font.name}</span>
          <span class="shrink-0 text-sm" style={{ fontFamily: font.family }}>Aa 123</span>
        </button>
      ))}
    </div>}
    <Button
      variant="link"
      size="xs"
      disabled={busy}
      class="self-start h-auto px-0 has-[>svg]:px-0 text-[11px]"
      onClick={() => input.current?.click()}
    >{busy && <Spinner class="size-3" />}{busy ? "Importing…" : "Import font from computer…"}</Button>
    <input
      ref={input}
      type="file"
      accept=".ttf,.otf,.woff,.woff2"
      class="hidden"
      aria-label={`Import ${label.toLowerCase()}`}
      onChange={async (e) => {
        const file = e.currentTarget.files?.[0];
        e.currentTarget.value = "";
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
          onChange(await importFont(file));
        } catch (error) {
          setError(error instanceof Error ? error.message : "Could not import the font.");
        } finally {
          setBusy(false);
        }
      }}
    />
    {error && <FieldError>{error}</FieldError>}
  </Field>;
}
