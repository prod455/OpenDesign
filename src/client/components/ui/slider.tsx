import { cn } from "@/lib/utils";

/**
 * shadcn Slider, on a native range input. Radix's Slider hides its thumb under
 * Preact (its item collection never registers, so the thumb has no value), and
 * the native input is keyboard- and screen-reader-ready on its own.
 */
export function Slider({
  class: className,
  value,
  min,
  max,
  step,
  onValueChange,
  "aria-label": label,
}: {
  class?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  "aria-label": string;
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range"
      data-slot="slider"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onInput={(e) => onValueChange(Number((e.target as HTMLInputElement).value))}
      style={{ "--slider-fill": `${Math.min(100, Math.max(0, percent))}%` }}
      class={cn("slider w-full", className)}
    />
  );
}
