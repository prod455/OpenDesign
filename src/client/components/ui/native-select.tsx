import type { ComponentProps } from "preact";
import { ChevronDown } from "lucide-preact";
import { cn } from "@/lib/utils";

/** shadcn NativeSelect: a real <select>, styled like Input. */
export function NativeSelect({ class: className, children, ...props }: ComponentProps<"select">) {
  return (
    <div class="group/native-select relative w-full min-w-0" data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        class={cn(
          "border-input h-8 w-full min-w-0 appearance-none rounded-md border bg-card pl-2.5 pr-8 py-1 text-xs shadow-xs transition-[color,box-shadow] outline-none cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className as string
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        class="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 select-none"
        aria-hidden="true"
      />
    </div>
  );
}
