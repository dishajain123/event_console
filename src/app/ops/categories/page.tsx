"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Layers3 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { MainCategoryDialog, SubCategoryDialog } from "@/components/event-categories/category-dialogs";
import {
  useCreateMainCategory,
  useCreateSubCategory,
  useDeleteMainCategory,
  useDeleteSubCategory,
  useMainCategories,
  useSubCategories,
  useUpdateMainCategory,
  useUpdateSubCategory,
} from "@/hooks/useEventCategories";
import type { ApiError } from "@/api/client";
import type {
  MainCategoryCreateIn,
  MainCategoryOut,
  MainCategoryUpdateIn,
  SubCategoryCreateIn,
  SubCategoryOut,
  SubCategoryUpdateIn,
} from "@/types/eventCategories";

type DeleteTarget =
  | { kind: "main"; id: string; name: string }
  | { kind: "sub"; id: string; name: string };

type StatusFilter = "all" | "active" | "inactive";

/**
 * All hooks, mutations, and dialogs are unchanged from before — same
 * `useMainCategories`/`useSubCategories` data, same create/update/
 * delete calls. What's new: a search box and an active/inactive filter
 * for the main-categories list (client-side, since this list is
 * already loaded in full — not a second filter on top of a paginated
 * backend response), and the raw `<table>` markup replaced with the
 * shared [Table] primitives for visual consistency with Events.
 */
export default function CategoriesPage() {
  const { data: mainCategories, isLoading, isError, refetch } = useMainCategories();
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState("");
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingMainCategory, setEditingMainCategory] = useState<MainCategoryOut | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const effectiveSelectedMainCategoryId = selectedMainCategoryId || mainCategories?.[0]?.id || "";
  const selectedMainCategory = useMemo(
    () => mainCategories?.find((category) => category.id === effectiveSelectedMainCategoryId) ?? null,
    [mainCategories, effectiveSelectedMainCategoryId],
  );

  const filteredMainCategories = useMemo(() => {
    return (mainCategories ?? []).filter((category) => {
      if (statusFilter === "active" && !category.is_active) return false;
      if (statusFilter === "inactive" && category.is_active) return false;
      if (search.trim() && !category.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [mainCategories, search, statusFilter]);
  const isFiltered = search.trim() !== "" || statusFilter !== "all";

  const {
    data: subCategories,
    isLoading: subLoading,
    isError: subError,
    refetch: refetchSubs,
  } = useSubCategories(effectiveSelectedMainCategoryId || undefined);

  const createMainCategory = useCreateMainCategory();
  const updateMainCategory = useUpdateMainCategory();
  const deleteMainCategory = useDeleteMainCategory();
  const createSubCategory = useCreateSubCategory();
  const updateSubCategory = useUpdateSubCategory();
  const deleteSubCategory = useDeleteSubCategory();

  async function saveMainCategory(payload: MainCategoryCreateIn | MainCategoryUpdateIn) {
    try {
      if (editingMainCategory) {
        await updateMainCategory.mutateAsync({
          mainCategoryId: editingMainCategory.id,
          payload: payload as MainCategoryUpdateIn,
        });
        toast.success("Main category updated");
      } else {
        await createMainCategory.mutateAsync(payload as MainCategoryCreateIn);
        toast.success("Main category created");
      }
      setMainDialogOpen(false);
      setEditingMainCategory(null);
    } catch (err) {
      toast.error("Couldn't save main category", {
        description: (err as ApiError)?.message ?? "Please try again.",
      });
    }
  }

  async function saveSubCategory(payload: SubCategoryCreateIn | SubCategoryUpdateIn) {
    try {
      if (editingSubCategory) {
        await updateSubCategory.mutateAsync({
          subCategoryId: editingSubCategory.id,
          payload: payload as SubCategoryUpdateIn,
        });
        toast.success("Sub category updated");
      } else {
        await createSubCategory.mutateAsync(payload as SubCategoryCreateIn);
        toast.success("Sub category created");
      }
      setSubDialogOpen(false);
      setEditingSubCategory(null);
    } catch (err) {
      toast.error("Couldn't save sub category", {
        description: (err as ApiError)?.message ?? "Please try again.",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "main") {
      await deleteMainCategory.mutateAsync(deleteTarget.id);
      if (effectiveSelectedMainCategoryId === deleteTarget.id) {
        setSelectedMainCategoryId("");
      }
      toast.success("Main category deleted");
    } else {
      await deleteSubCategory.mutateAsync(deleteTarget.id);
      toast.success("Sub category deleted");
    }
  }

  const subCategoryList = subCategories ?? selectedMainCategory?.sub_categories ?? [];

  return (
    <div>
      <Header title="Categories" />
      <PageToolbar
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditingMainCategory(null);
                setMainDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New main category
            </Button>
            <Button
              onClick={() => {
                setEditingSubCategory(null);
                setSubDialogOpen(true);
              }}
              disabled={!effectiveSelectedMainCategoryId}
            >
              <Plus className="h-4 w-4" />
              New sub category
            </Button>
          </>
        }
      />

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            placeholder="Search main categories…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel padded={false}>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Main categories</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                These are the top-level buckets seen by the console and mobile app.
              </p>
            </div>
            <Badge tone="neutral">{filteredMainCategories.length} of {mainCategories?.length ?? 0}</Badge>
          </div>

          {isLoading ? (
            <div className="p-5">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : isError ? (
            <div className="p-5">
              <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
            </div>
          ) : !mainCategories || mainCategories.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Layers3}
                title="No main categories yet"
                description="Create the first main category, then add sub categories underneath it."
                action={{ label: "Create main category", onClick: () => setMainDialogOpen(true) }}
              />
            </div>
          ) : filteredMainCategories.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Layers3} title="No categories match your filters" description="Try a different search term or status." />
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Main category</TableHeaderCell>
                    <TableHeaderCell>Sub categories</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMainCategories.map((category) => {
                    const active = category.id === effectiveSelectedMainCategoryId;
                    return (
                      <TableRow
                        key={category.id}
                        clickable
                        className={active ? "bg-black/[0.02]" : undefined}
                        onClick={() => setSelectedMainCategoryId(category.id)}
                      >
                        <TableCell>
                          <p className="font-medium text-[var(--foreground)]">{category.name}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">{category.description || "—"}</p>
                        </TableCell>
                        <TableCell className="text-[var(--foreground-muted)]">{category.sub_categories.length}</TableCell>
                        <TableCell>
                          <Badge tone={category.is_active ? "success" : "neutral"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMainCategory(category);
                                setMainDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({ kind: "main", id: category.id, name: category.name });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassPanel>

        <GlassPanel padded={false}>
          <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Sub categories</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                Active subcategories appear in mobile browsing. Home cards preview the first three alphabetically, with a count of any others.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{subCategoryList.length} total</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingSubCategory(null);
                  setSubDialogOpen(true);
                }}
                disabled={!effectiveSelectedMainCategoryId}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="px-5 pb-3.5">
            <Select value={effectiveSelectedMainCategoryId} onChange={(e) => setSelectedMainCategoryId(e.target.value)}>
              <option value="">Select a main category</option>
              {mainCategories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          {!effectiveSelectedMainCategoryId ? (
            <div className="p-5">
              <EmptyState icon={Layers3} title="Pick a main category" description="Choose a main category to view and manage its sub categories." />
            </div>
          ) : subLoading ? (
            <div className="p-5">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : subError ? (
            <div className="p-5">
              <ErrorState onRetry={() => refetchSubs()} description="Check the backend connection and try again." />
            </div>
          ) : subCategoryList.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Layers3}
                title="No sub categories yet"
                description="Add sub categories under this main category so events can use them."
                action={{ label: "Create sub category", onClick: () => setSubDialogOpen(true) }}
              />
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Sub category</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subCategoryList.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <p className="font-medium text-[var(--foreground)]">{category.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{category.description || "—"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge tone={category.is_active ? "success" : "neutral"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSubCategory(category);
                              setSubDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ kind: "sub", id: category.id, name: category.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassPanel>
      </div>

      <MainCategoryDialog
        open={mainDialogOpen}
        onClose={() => {
          setMainDialogOpen(false);
          setEditingMainCategory(null);
        }}
        category={editingMainCategory}
        loading={createMainCategory.isPending || updateMainCategory.isPending}
        onSubmit={saveMainCategory}
      />

      <SubCategoryDialog
        open={subDialogOpen}
        onClose={() => {
          setSubDialogOpen(false);
          setEditingSubCategory(null);
        }}
        category={editingSubCategory}
        mainCategories={mainCategories ?? []}
        defaultMainCategoryId={effectiveSelectedMainCategoryId || undefined}
        loading={createSubCategory.isPending || updateSubCategory.isPending}
        onSubmit={saveSubCategory}
      />

      <ConfirmActionDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={deleteTarget?.kind === "main" ? "Delete main category?" : "Delete sub category?"}
        description={
          deleteTarget?.kind === "main"
            ? "This will logically delete this main category, all its subcategories, and all events under them. They will disappear from the console and mobile app. Registration and payment history will be retained."
            : "This will logically delete this subcategory and all its events. They will disappear from the console and mobile app. Registration and payment history will be retained."
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={async () => {
          await confirmDelete();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}