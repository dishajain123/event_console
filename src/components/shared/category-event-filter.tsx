import { Select } from "@/components/ui/select";
import type { CategoryEventFilterState } from "@/hooks/useCategoryEventFilter";

/**
 * Renders the Main Category -> Sub Category -> Event cascade driven by
 * [useCategoryEventFilter]. Purely presentational: all state and data
 * fetching lives in the hook so screens can drop this in next to their
 * own filters (rating, date range, search, ...) without duplicating the
 * cascade logic.
 */
export function CategoryEventFilter({ filter }: { filter: CategoryEventFilterState }) {
  return (
    <>
      <Select
        className="w-48"
        value={filter.mainCategoryId}
        onChange={(event) => filter.selectMainCategory(event.target.value)}
        aria-label="Main category"
      >
        <option value="">All main categories</option>
        {filter.mainCategories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Select
        className="w-44"
        value={filter.subCategoryId}
        onChange={(event) => filter.selectSubCategory(event.target.value)}
        disabled={!filter.mainCategoryId}
        aria-label="Sub category"
      >
        <option value="">All subcategories</option>
        {filter.subCategories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Select
        className="w-48"
        value={filter.eventId}
        onChange={(event) => filter.selectEvent(event.target.value)}
        aria-label="Event"
      >
        <option value="">All events</option>
        {filter.events.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
    </>
  );
}
