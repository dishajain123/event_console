import { apiClient } from "@/api/client";
import type {
  MainCategoryCreateIn,
  MainCategoryOut,
  MainCategoryUpdateIn,
  SubCategoryCreateIn,
  SubCategoryOut,
  SubCategoryUpdateIn,
} from "@/types/eventCategories";

export async function listMainCategories(): Promise<MainCategoryOut[]> {
  const { data } = await apiClient.get<MainCategoryOut[]>("/event-categories/main");
  return data;
}

export async function createMainCategory(payload: MainCategoryCreateIn): Promise<MainCategoryOut> {
  const { data } = await apiClient.post<MainCategoryOut>("/event-categories/main", payload);
  return data;
}

export async function updateMainCategory(
  mainCategoryId: string,
  payload: MainCategoryUpdateIn,
): Promise<MainCategoryOut> {
  const { data } = await apiClient.patch<MainCategoryOut>(
    `/event-categories/main/${mainCategoryId}`,
    payload,
  );
  return data;
}

export async function deleteMainCategory(mainCategoryId: string): Promise<void> {
  await apiClient.delete(`/event-categories/main/${mainCategoryId}`);
}

export async function listSubCategories(mainCategoryId?: string): Promise<SubCategoryOut[]> {
  const { data } = await apiClient.get<SubCategoryOut[]>("/event-categories/sub", {
    params: mainCategoryId ? { main_category_id: mainCategoryId } : undefined,
  });
  return data;
}

export async function createSubCategory(payload: SubCategoryCreateIn): Promise<SubCategoryOut> {
  const { data } = await apiClient.post<SubCategoryOut>("/event-categories/sub", payload);
  return data;
}

export async function updateSubCategory(
  subCategoryId: string,
  payload: SubCategoryUpdateIn,
): Promise<SubCategoryOut> {
  const { data } = await apiClient.patch<SubCategoryOut>(
    `/event-categories/sub/${subCategoryId}`,
    payload,
  );
  return data;
}

export async function deleteSubCategory(subCategoryId: string): Promise<void> {
  await apiClient.delete(`/event-categories/sub/${subCategoryId}`);
}

