/** Shapes shared by the catalog, drawer and project pages. */

export type IncludeItem = { name: string; price: number };

export type ProjectAbstract = {
  objective: string;
  methodology: string;
  results: string;
  keywords: string;
};

/** `stack_detail` is free-form JSON in the database; these are the keys the
 *  stack panel knows how to render. */
export type StackDetail = {
  kind?: string;
  algorithm?: string;
  accuracy?: string;
  dataset?: string;
  training?: string;
  model?: string;
  frontend?: string | string[];
  backend?: string | string[];
  db?: string | string[];
  auth?: string | string[];
  deploy?: string | string[];
};

/** The fields loaded for the homepage catalog. The heavier `abstract` and
 *  `stack_detail` columns are fetched when the drawer opens. */
export type ProjectSummary = {
  id: string;
  title: string;
  cat: string;
  tag: string;
  color: string;
  price: number;
  rating: number;
  downloads: number;
  level: string;
  stack: string[];
  description: string;
  files: number;
  pages: number;
  includes: IncludeItem[];
  youtube_link: string | null;
  abstract?: ProjectAbstract | null;
  stack_detail?: StackDetail | null;
};

/** A pricing tier rendered by the homepage Pricing section. */
export type Bundle = {
  id: string;
  title: string;
  description: string;
  price: number;
  project_ids: string[];
  color: string;
  features: string[];
  cta: string;
  featured: boolean;
  created_at?: string;
};

/** A project joined onto a payment row (only the columns the card renders). */
export type PurchasedProject = Pick<
  ProjectSummary,
  | "id" | "title" | "cat" | "tag" | "color" | "level"
  | "stack" | "rating" | "files" | "pages" | "description"
>;

export type PaymentRecord = {
  id: string;
  created_at: string;
  amount: number;
  project_id: string | null;
  project_title: string | null;
  razorpay_payment_id?: string | null;
  project?: PurchasedProject | null;
};
