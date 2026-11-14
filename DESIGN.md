# OpenDesign UI

The interface is built from [shadcn/ui](https://ui.shadcn.com) components on
Tailwind CSS 4. The components live in `src/client/components/ui/` and are
plain source files: edit them there.

## Tokens

Every interface colour is a token in `src/client/styles.css` (`:root`), used
through Tailwind as `bg-primary`, `text-muted-foreground`, `border-input` and
so on. The palette is "Petróleo e Areia": petrol blue for actions, warm sand for
surfaces and lines.

| Token | Role |
| --- | --- |
| `background` / `foreground` | Page and its text |
| `card`, `popover` | Panels, cards, menus |
| `primary` | The one main action, active states, focus |
| `secondary`, `muted` | Quiet surfaces; `muted-foreground` for supporting text |
| `accent` | Hover and selected backgrounds |
| `destructive` | Delete and errors |
| `border`, `input`, `ring` | Lines, control borders, focus ring |
| `workspace` | The desk the canvas pages sit on |

Fabric paints selection frames and new shapes itself and cannot read CSS
variables: those use `PRIMARY_HEX` in `src/client/lib/theme.ts`, which mirrors
`--primary`. Change both together.

Colours inside a design (swatches, gradient presets, template content) are the
user's content, not interface tokens.

## Rules

- Colour, radius and shadow come from tokens. No hex values in components.
- Buttons, fields, menus, toggles and sliders come from `components/ui`. Do not
  hand-build their markup.
- One primary (`variant="default"`) button per screen or panel; everything else
  is `outline`, `secondary` or `ghost`.
- An icon-only button is an `IconButton`: its `label` is the tooltip and the
  accessible name.
- A label and its control go in a `Field`; space comes from the container's
  `gap`, not from margins.
- Components take `class`, never `className`.

## Preact notes

The app runs on Preact with `react` aliased to `preact/compat`, so Radix
primitives work. Two exceptions found so far:

- **Slider** is a styled native `<input type="range">`: Radix's Slider hides its
  thumb under Preact.
- Components that a Radix trigger wraps with `asChild` (`Button`, `Input`) use
  `forwardRef`, because Preact function components only receive a ref that way.
