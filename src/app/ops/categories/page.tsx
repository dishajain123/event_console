"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Layers3 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function CategoriesPage() {
  const { data: mainCategories, isLoading, isError, refetch } = useMainCategories();
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState("");
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingMainCategory, setEditingMainCategory] = useState<MainCategoryOut | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const effectiveSelectedMainCategoryId = selectedMainCategoryId || mainCategories?.[0]?.id || "";
  const selectedMainCategory = useMemo(
    () => mainCategories?.find((category) => category.id === effectiveSelectedMainCategoryId) ?? null,
    [mainCategories, effectiveSelectedMainCategoryId],
  );

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

      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
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
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel padded={false}>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Main categories</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                These are the top-level buckets seen by the console and mobile app.
              </p>
            </div>
            <Badge tone="neutral">{mainCategories?.length ?? 0} total</Badge>
          </div>

          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
            </div>
          ) : !mainCategories || mainCategories.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Layers3}
                title="No main categories yet"
                description="Create the first main category, then add sub categories underneath it."
                action={{ label: "Create main category", onClick: () => setMainDialogOpen(true) }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                  <th className="px-6 py-3 font-medium">Main category</th>
                  <th className="px-6 py-3 font-medium">Sub categories</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {mainCategories.map((category) => {
                  const active = category.id === effectiveSelectedMainCategoryId;
                  return (
                    <tr
                      key={category.id}
                      className={`cursor-pointer transition-colors hover:bg-black/[0.02] ${active ? "bg-black/[0.02]" : ""}`}
                      onClick={() => setSelectedMainCategoryId(category.id)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--foreground)]">{category.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{category.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-[var(--foreground-muted)]">{category.sub_categories.length}</td>
                      <td className="px-6 py-4">
                        <Badge tone={category.is_active ? "success" : "neutral"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </GlassPanel>

        <GlassPanel padded={false}>
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Sub categories</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                These belong to the selected main category and feed the event form.
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

          <div className="px-6 pb-4">
            <select
              className="glass-input h-11 w-full appearance-none px-4 text-sm text-[var(--foreground)] outline-none"
              value={effectiveSelectedMainCategoryId}
              onChange={(e) => setSelectedMainCategoryId(e.target.value)}
            >
              <option value="">Select a main category</option>
              {mainCategories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {!effectiveSelectedMainCategoryId ? (
            <div className="p-6">
              <EmptyState
                icon={Layers3}
                title="Pick a main category"
                description="Choose a main category to view and manage its sub categories."
              />
            </div>
          ) : subLoading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : subError ? (
            <div className="p-6">
              <ErrorState onRetry={() => refetchSubs()} description="Check the backend connection and try again." />
            </div>
          ) : subCategoryList.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Layers3}
                title="No sub categories yet"
                description="Add sub categories under this main category so events can use them."
                action={{ label: "Create sub category", onClick: () => setSubDialogOpen(true) }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                  <th className="px-6 py-3 font-medium">Sub category</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {subCategoryList.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-black/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--foreground)]">{category.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{category.description || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={category.is_active ? "success" : "neutral"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            ? "This is blocked if sub categories or events still use it."
            : "This is blocked if events still use this sub category."
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
