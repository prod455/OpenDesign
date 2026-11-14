import type { ComponentProps } from "preact";
import { cn } from "@/lib/utils";

export function Label({ class: className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      class={cn(
        "flex items-center gap-2 text-[11px] leading-none font-medium text-muted-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className as string
      )}
      {...props}
    />
  );
}
