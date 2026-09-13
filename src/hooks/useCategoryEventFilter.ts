import { useMemo, useState } from "react";
import { useMainCategories, useSubCategories } from "@/hooks/useEventCategories";
import { useEvents } from "@/hooks/useEvents";

/**
 * Shared Main Category -> Sub Category -> Event cascading filter state.
 * One hook backs the filter UI on Feedback, Sponsors, Media and Incidents
 * so the cascade/reset behavior (and the query params derived from it)
 * stay identical across screens instead of being reimplemented per page.
 */
export function useCategoryEventFilter() {
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [eventId, setEventId] = useState("");

  const mainCategories = useMainCategories();
  const subCategories = useSubCategories(mainCategoryId || undefined);
  const events = useEvents({
    mainCategoryId: mainCategoryId || undefined,
    subCategoryId: subCategoryId || undefined,
  });

  function selectMainCategory(value: string) {
    setMainCategoryId(value);
    setSubCategoryId("");
    setEventId("");
  }

  function selectSubCategory(value: string) {
    setSubCategoryId(value);
    setEventId("");
  }

  function selectEvent(value: string) {
    setEventId(value);
  }

  function reset() {
    setMainCategoryId("");
    setSubCategoryId("");
    setEventId("");
  }

  const isFiltered = !!(mainCategoryId || subCategoryId || eventId);

  return useMemo(
    () => ({
      mainCategoryId,
      subCategoryId,
      eventId,
      selectMainCategory,
      selectSubCategory,
      selectEvent,
      reset,
      isFiltered,
      mainCategories: mainCategories.data ?? [],
      subCategories: subCategories.data ?? [],
      events: events.data ?? [],
      isLoadingMainCategories: mainCategories.isLoading,
      isLoadingSubCategories: subCategories.isLoading,
      isLoadingEvents: events.isLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mainCategoryId, subCategoryId, eventId, mainCategories.data, subCategories.data, events.data, mainCategories.isLoading, subCategories.isLoading, events.isLoading],
  );
}

export type CategoryEventFilterState = ReturnType<typeof useCategoryEventFilter>;
