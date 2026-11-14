import type { ComponentProps } from "preact";
import { cn } from "@/lib/utils";

/** shadcn Empty: what a list says when it has nothing to show yet. */
export function Empty({ class: className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      class={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center text-balance", className as string)}
      {...props}
    />
  );
}

export function EmptyHeader({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="empty-header" class={cn("flex max-w-sm flex-col items-center gap-2 text-center", className as string)} {...props} />;
}

export function EmptyMedia({ class: className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-icon"
      class={cn("bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6", className as string)}
      {...props}
    />
  );
}

export function EmptyTitle({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="empty-title" class={cn("text-sm font-medium tracking-tight", className as string)} {...props} />;
}

export function EmptyDescription({ class: className, ...props }: ComponentProps<"p">) {
  return <p data-slot="empty-description" class={cn("text-muted-foreground m-0 text-xs/relaxed", className as string)} {...props} />;
}

export function EmptyContent({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="empty-content" class={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-balance", className as string)} {...props} />;
}
