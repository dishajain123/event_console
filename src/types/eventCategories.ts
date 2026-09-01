export interface MainCategorySummary {
  id: string;
  name: string;
}

export interface SubCategorySummary {
  id: string;
  main_category_id: string;
  name: string;
}

export interface SubCategoryOut extends SubCategorySummary {
  description: string | null;
  is_active: boolean;
}

export interface MainCategoryOut extends MainCategorySummary {
  description: string | null;
  is_active: boolean;
  sub_categories: SubCategoryOut[];
}

export interface MainCategoryCreateIn {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface MainCategoryUpdateIn {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface SubCategoryCreateIn {
  main_category_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface SubCategoryUpdateIn {
  main_category_id?: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

