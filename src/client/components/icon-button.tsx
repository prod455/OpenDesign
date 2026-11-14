import type { ComponentProps } from "preact";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = Omit<ComponentProps<typeof Button>, "aria-label" | "title"> & {
  /** Said by the tooltip and read by screen readers: an icon alone names nothing. */
  label: string;
  side?: "top" | "right" | "bottom" | "left";
};

/** A ghost icon Button with its name in a tooltip. */
export function IconButton({ label, side = "bottom", variant = "ghost", size = "icon-sm", ...props }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} aria-label={label} {...props} />
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
