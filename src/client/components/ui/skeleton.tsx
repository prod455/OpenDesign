import type { ComponentProps } from "preact";
import { cn } from "@/lib/utils";

export function Skeleton({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" class={cn("bg-muted animate-pulse rounded-md", className as string)} {...props} />;
}
