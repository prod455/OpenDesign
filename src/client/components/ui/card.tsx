import type { ComponentProps } from "preact";
import { cn } from "@/lib/utils";

export function Card({ class: className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      class={cn("bg-card text-card-foreground flex flex-col rounded-xl border shadow-xs", className as string)}
      {...props}
    />
  );
}

export function CardContent({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" class={cn("p-3", className as string)} {...props} />;
}

export function CardTitle({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-title" class={cn("truncate text-xs leading-none font-semibold", className as string)} {...props} />;
}

export function CardDescription({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-description" class={cn("text-muted-foreground text-[11px]", className as string)} {...props} />;
}
