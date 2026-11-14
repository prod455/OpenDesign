import { Loader2 } from "lucide-preact";
import { cn } from "@/lib/utils";

/** Always decorative: the text next to it says what is happening. */
export function Spinner({ class: className }: { class?: string }) {
  return <Loader2 aria-hidden="true" class={cn("size-4 animate-spin", className)} />;
}
