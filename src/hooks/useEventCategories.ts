import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMainCategory,
  createSubCategory,
  deleteMainCategory,
  deleteSubCategory,
  listMainCategories,
  listSubCategories,
  updateMainCategory,
  updateSubCategory,
} from "@/api/eventCategories";
import { useSessionStore } from "@/state/sessionStore";
import type {
  MainCategoryCreateIn,
  MainCategoryUpdateIn,
  SubCategoryCreateIn,
  SubCategoryUpdateIn,
} from "@/types/eventCategories";

export const eventCategoryQueryKeys = {
  main: ["event-categories", "main"] as const,
  sub: (mainCategoryId?: string) => ["event-categories", "sub", mainCategoryId ?? "all"] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useMainCategories() {
  const ready = useReady();
  return useQuery({
    queryKey: eventCategoryQueryKeys.main,
    queryFn: listMainCategories,
    enabled: ready,
  });
}

export function useSubCategories(mainCategoryId?: string) {
  const ready = useReady();
  return useQuery({
    queryKey: eventCategoryQueryKeys.sub(mainCategoryId),
    queryFn: () => listSubCategories(mainCategoryId),
    enabled: ready && !!mainCategoryId,
  });
}

export function useCreateMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MainCategoryCreateIn) => createMainCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mainCategoryId, payload }: { mainCategoryId: string; payload: MainCategoryUpdateIn }) =>
      updateMainCategory(mainCategoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mainCategoryId: string) => deleteMainCategory(mainCategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubCategoryCreateIn) => createSubCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subCategoryId,
      payload,
    }: {
      subCategoryId: string;
      payload: SubCategoryUpdateIn;
    }) => updateSubCategory(subCategoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subCategoryId: string) => deleteSubCategory(subCategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-categories"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
