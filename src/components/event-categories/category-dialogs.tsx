"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type {
  MainCategoryCreateIn,
  MainCategoryOut,
  MainCategoryUpdateIn,
  SubCategoryCreateIn,
  SubCategoryOut,
  SubCategoryUpdateIn,
} from "@/types/eventCategories";

const mainSchema = z.object({
  name: z.string().min(2, "Give the category a name"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

const subSchema = z.object({
  mainCategoryId: z.string().min(1, "Pick a main category"),
  name: z.string().min(2, "Give the sub category a name"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type MainFormValues = z.infer<typeof mainSchema>;
type SubFormValues = z.infer<typeof subSchema>;

export function MainCategoryDialog({
  open,
  onClose,
  category,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  category?: MainCategoryOut | null;
  onSubmit: (payload: MainCategoryCreateIn | MainCategoryUpdateIn) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MainFormValues>({
    resolver: zodResolver(mainSchema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
      isActive: category?.is_active ?? true,
    });
  }, [open, category, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Edit main category" : "Create a main category"}
      description="Main categories are the top-level buckets shown across the console and mobile app."
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            name: values.name,
            description: values.description || null,
            is_active: values.isActive,
          });
        })}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Name</label>
          <Input placeholder="e.g. CORPORATE 360°" error={!!errors.name} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Textarea placeholder="A short description for operators" {...register("description")} />
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label={field.value ? "Active" : "Inactive"}
              description="Inactive categories can be kept for reference without showing up in new selections."
            />
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {category ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function SubCategoryDialog({
  open,
  onClose,
  category,
  mainCategories,
  defaultMainCategoryId,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  category?: SubCategoryOut | null;
  mainCategories: MainCategoryOut[];
  defaultMainCategoryId?: string | null;
  onSubmit: (payload: SubCategoryCreateIn | SubCategoryUpdateIn) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SubFormValues>({
    resolver: zodResolver(subSchema),
    defaultValues: { mainCategoryId: "", name: "", description: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      mainCategoryId: category?.main_category_id ?? defaultMainCategoryId ?? "",
      name: category?.name ?? "",
      description: category?.description ?? "",
      isActive: category?.is_active ?? true,
    });
  }, [open, category, defaultMainCategoryId, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Edit sub category" : "Create a sub category"}
      description="Sub categories always belong to one selected main category."
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            main_category_id: values.mainCategoryId,
            name: values.name,
            description: values.description || null,
            is_active: values.isActive,
          });
        })}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Main category</label>
          <Select error={!!errors.mainCategoryId} {...register("mainCategoryId")}>
            <option value="">Select a main category</option>
            {mainCategories.map((main) => (
              <option key={main.id} value={main.id}>
                {main.name}
              </option>
            ))}
          </Select>
          {errors.mainCategoryId && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.mainCategoryId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Name</label>
          <Input placeholder="e.g. Business" error={!!errors.name} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Textarea placeholder="A short description for operators" {...register("description")} />
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label={field.value ? "Active" : "Inactive"}
              description="Inactive subcategories can be kept for reference without showing up in new selections."
            />
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {category ? "Save changes" : "Create sub category"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
