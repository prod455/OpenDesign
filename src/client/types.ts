export interface CustomFont {
  family: string;
  name: string;
  url: string;
}

export interface Design {
  id: string;
  name: string;
  canvas_json: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

/** What a new design is made from: a template, or an imported image. */
export type NewDesign = Pick<Template, "name" | "canvas_json" | "width" | "height">;

export interface Page {
  id: string;
  design_id: string;
  title: string;
  canvas_json: string;
  sort_order: number;
  created_at: string;
}

export interface DesignWithPages extends Design {
  pages: Page[];
}

export interface BrandKit {
  id: string;
  name: string;
  colors: string[];
  heading_font: string;
  body_font: string;
  logos: string[];
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  canvas_json: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  sort_order: number;
}
