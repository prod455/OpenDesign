import type { ComponentProps } from "preact";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/** A form control with its label, help and error, stacked with one gap. */
export function Field({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="field" role="group" class={cn("flex w-full flex-col gap-1.5", className as string)} {...props} />;
}

export function FieldLabel({ class: className, ...props }: ComponentProps<"label">) {
  return <Label data-slot="field-label" class={cn("justify-between", className as string)} {...props} />;
}

/** The label of a control that is not a single form element (a button group, a swatch grid). */
export function FieldTitle({ class: className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      class={cn("flex items-center justify-between gap-2 text-[11px] leading-none font-medium text-muted-foreground", className as string)}
      {...props}
    />
  );
}

export function FieldDescription({ class: className, ...props }: ComponentProps<"p">) {
  return <p data-slot="field-description" class={cn("m-0 text-[11px] leading-snug text-muted-foreground", className as string)} {...props} />;
}

export function FieldError({ class: className, ...props }: ComponentProps<"p">) {
  return <p data-slot="field-error" role="alert" class={cn("m-0 text-[11px] text-destructive", className as string)} {...props} />;
}
