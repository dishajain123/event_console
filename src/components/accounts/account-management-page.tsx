"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ShieldAlert, ShieldUser, Users2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MobileNumberField } from "@/components/shared/mobile-number-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useSessionStore } from "@/state/sessionStore";
import { assignRole, listAssignableRoles } from "@/api/rbac";
import { designateEventManager, findOrCreateUserForProvisioning, listAccounts, updateAccountStatus } from "@/api/identity";
import type { ApiError } from "@/api/client";
import type { RoleName } from "@/types/rbac";
import { formatIndianMobileDisplay, normalizeIndianMobileNumber } from "@/lib/phone";
import { useMutation, useQuery } from "@tanstack/react-query";

const schema = z.object({
  mobileNumber: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .max(10, "Enter a valid 10-digit mobile number")
    .regex(/^\d+$/, "Digits only"),
  name: z.string().optional(),
  role: z.string().min(1, "Choose a role"),
});

type FormValues = z.infer<typeof schema>;

function roleLabel(roleName: string): string {
  switch (roleName) {
    case "super_admin":
      return "Super Admin";
    case "operations_admin":
      return "Operations Admin";
    case "finance_admin":
      return "Finance Admin";
    case "finance_operator":
      return "Finance Operator";
    case "finance_auditor":
      return "Finance Auditor";
    case "event_manager":
      return "Event Manager";
    default:
      return roleName.replaceAll("_", " ");
  }
}

const PAGE_SIZE = 100;

interface AccountManagementPageProps {
  /** Header title. Defaults to the original unscoped "Account Management". */
  title?: string;
  /** Create-panel description override. Defaults to a generic message when omitted. */
  description?: string;
  /**
   * Restricts both the "create an account" role dropdown and the account
   * list/filter to this set of roles — e.g. the Ops "Admin Accounts" page
   * only ever needs Operations Admin + Event Manager, and the Finance
   * "Finance Accounts" page only needs Finance Admin/Operator/Auditor.
   * A Super Admin's `GET /roles/assignable` response still returns every
   * role they're allowed to grant (backend-enforced, unchanged) — this
   * prop only narrows what that superset renders on *this* page, so each
   * section stays focused on its own accounts instead of mixing Finance
   * and Operations staff in one list. Omit for the original unscoped
   * behavior (every assignable role, every manageable account).
   */
  roleScope?: RoleName[];
}

/** Account provisioning and server-authorized disable/reactivate actions.
 * Scoped managers see only volunteers they may manage; global administrators
 * retain their provisioning workflow. */
export function AccountManagementPage({ title = "Account Management", description, roleScope }: AccountManagementPageProps = {}) {
  const queryClient = useQueryClient();
  const roles = useSessionStore((s) => s.roles);
  const canProvision = roles.global.some(role => ["super_admin", "operations_admin", "finance_admin"].includes(role));
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  const {
    data: allRoleOptions = [],
    isLoading: rolesLoading,
    isError: rolesError,
  } = useQuery({
    queryKey: ["assignable-roles"],
    queryFn: listAssignableRoles,
    enabled: canProvision,
  });
  // Backend-authorized superset, narrowed to this page's section. Assigning
  // a role outside `roleScope` was never possible from here to begin with
  // (the dropdown simply never listed it) — this doesn't change what the
  // backend allows, only what one page chooses to surface.
  const roleOptions = useMemo(
    () => (roleScope ? allRoleOptions.filter((role) => roleScope.includes(role.name)) : allRoleOptions),
    [allRoleOptions, roleScope],
  );

  const {
    data: accountPage,
    isLoading: accountsLoading,
    isError: accountsError,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ["accounts", page],
    queryFn: () => listAccounts({ page, pageSize: PAGE_SIZE }),
  });
  const accounts = useMemo(() => accountPage?.items ?? [], [accountPage]);
  const totalPages = accountPage ? Math.max(1, Math.ceil(accountPage.total / PAGE_SIZE)) : 1;

  const defaultRole = roleOptions[0]?.name ?? "event_manager";

  const { register, handleSubmit, control, reset, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mobileNumber: "", name: "", role: defaultRole },
  });

  useEffect(() => {
    if (!roleOptions.length) return;
    const currentRole = getValues("role");
    if (!currentRole || !roleOptions.some((role) => role.name === currentRole)) {
      setValue("role", roleOptions[0].name, { shouldDirty: false, shouldValidate: true });
    }
  }, [getValues, roleOptions, setValue]);

  const provision = useMutation({
    mutationFn: async (values: FormValues) => {
      const mobileNumber = normalizeIndianMobileNumber(values.mobileNumber);
      const user = await findOrCreateUserForProvisioning(mobileNumber, values.name, values.role === "event_manager");
      if (values.role !== "event_manager") await assignRole(user.id, {
        user_id: user.id,
        role_name: values.role as RoleName,
        event_id: null,
      });
      return { mobileNumber };
    },
    onSuccess: async ({ mobileNumber }, values) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["event-managers"] });
      setFormError(null);
      toast.success("Account created", {
        description: values.role === "event_manager" ? "Event Manager account is ready to be selected when creating an event." : `${values.name || formatIndianMobileDisplay(mobileNumber)} can now sign in as ${roleLabel(values.role)}.`,
      });
      reset({ mobileNumber: "", name: "", role: roleOptions[0]?.name ?? "event_manager" });
    },
    onError: (error: ApiError) => {
      const message = error?.message ?? "Couldn't create this account. Please try again.";
      setFormError(message);
      toast.error("Could not create account", { description: message });
    },
  });

  const designate = useMutation({
    mutationFn: designateEventManager,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["event-managers"] });
      toast.success("Account is now eligible for Event Manager assignment");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (payload: { userId: string; isActive: boolean }) =>
      updateAccountStatus(payload.userId, { is_active: payload.isActive }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["event-managers"] });
      toast.success("Account updated");
    },
    onError: (error: ApiError) => {
      const message = error?.message ?? "Couldn't update account status.";
      setActionError(message);
      toast.error("Update failed", { description: message });
    },
  });

  const roleOptionsLoaded = roleOptions.length > 0;
  const createEnabled = roleOptionsLoaded && !rolesLoading;

  // Accounts whose only active roles fall outside this page's section
  // (e.g. a Finance Operator showing up on the Ops Admin Accounts page)
  // are dropped before search/role filtering — each section only ever
  // needs to see its own staff. An account with no admin role yet (a
  // regular app user) is dropped the same way; it was never something
  // either section's list was useful for. Omit `roleScope` to keep the
  // original unfiltered "every manageable account" behavior.
  const inScopeAccounts = useMemo(() => {
    if (!roleScope) return accounts;
    return accounts.filter((account) => {
      const activeRoleNames = account.roles.filter((r) => r.status === "active").map((r) => r.role_name);
      if (account.is_event_manager) activeRoleNames.push("event_manager");
      return activeRoleNames.some((role) => roleScope.includes(role as RoleName));
    });
  }, [accounts, roleScope]);

  const sortedAccounts = useMemo(
    () => [...inScopeAccounts].sort((a, b) => Number(b.is_active) - Number(a.is_active) || (a.mobile_number ?? a.email ?? a.id).localeCompare(b.mobile_number ?? b.email ?? b.id)),
    [inScopeAccounts],
  );

  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sortedAccounts.filter((account) => {
      const activeRoleNames = account.roles.filter((r) => r.status === "active").map((r) => r.role_name);
      if (account.is_event_manager) activeRoleNames.push("event_manager");
      if (roleFilter !== "all" && !activeRoleNames.includes(roleFilter as RoleName)) return false;
      if (!term) return true;
      const haystack = [account.name, account.mobile_number, account.email].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [sortedAccounts, search, roleFilter]);
  const isFiltered = search.trim() !== "" || roleFilter !== "all";

  const createDescription = description
    ?? (roleScope && roleOptions.length > 0
      ? `Create ${roleOptions.map((role) => roleLabel(role.name)).join(", ")} accounts.`
      : "Role options come from the backend and follow your permission scope.");

  return (
    <div>
      <Header title={title} />

      <div className={canProvision ? "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]" : "grid grid-cols-1 gap-4"}>
        {canProvision && <GlassPanel className="rise-in h-fit">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)]">
              <ShieldUser className="h-4 w-4 text-[var(--accent-strong)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Create an account</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                {createDescription}
              </p>
            </div>
          </div>

          {roleOptionsLoaded || rolesLoading ? (
          <form onSubmit={handleSubmit((values) => provision.mutate(values))} className="space-y-3.5">
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field }) => (
                <MobileNumberField
                  id="account-mobile"
                  label="Mobile number"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.mobileNumber}
                  errorMessage={errors.mobileNumber?.message}
                  helperText="If this number does not have an account yet, it will be created first."
                />
              )}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Name <span className="text-[var(--foreground-subtle)]">(optional)</span>
              </label>
              <Input placeholder="Jane Doe" {...register("name")} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Role</label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onChange={field.onChange} disabled={!createEnabled}>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.name}>
                        {roleLabel(role.name)}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={provision.isPending} disabled={!createEnabled}>
              Create account
            </Button>
          </form>
          ) : (
            <p className="text-xs text-[var(--foreground-subtle)]">
              You don&apos;t have permission to create any of this section&apos;s account types.
            </p>
          )}

          {rolesError && (
            <p className="mt-3 text-xs text-[var(--danger)]">Could not load role options. Try refreshing.</p>
          )}
        </GlassPanel>}

        <GlassPanel padded={false} className="rise-in">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">All accounts</h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              Account visibility and available actions follow your backend permission scope.
            </p>
          </div>

          <div className="px-5 pt-4">
            <FilterBar
              isFiltered={isFiltered}
              onReset={() => {
                setSearch("");
                setRoleFilter("all");
              }}
              className="mb-0"
            >
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                <Input placeholder="Search name or mobile…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select className="w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.name}>
                    {roleLabel(role.name)}
                  </option>
                ))}
              </Select>
            </FilterBar>
          </div>

          {accountsLoading ? (
            <div className="p-5">
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : accountsError ? (
            <div className="p-5">
              <ErrorState onRetry={() => refetchAccounts()} description="Check the backend connection and try again." />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Users2}
                title={isFiltered ? "No accounts match your filters" : "No accounts yet"}
                description={isFiltered ? "Try a different search term or role." : "Create the first account using the form on the left."}
              />
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Person</TableHeaderCell>
                    <TableHeaderCell>Roles</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    // Scoped roles can repeat across events; this column summarizes
                    // role names, while account.roles retains every assignment.
                    const accountRoleNames = [...new Set(
                      [...account.roles.filter((role) => role.status === "active").map((role) => role.role_name),
                        ...(account.is_event_manager ? ["event_manager"] : [])],
                    )];
                    const canToggle = account.can_manage_status;

                    return (
                      <TableRow key={account.id}>
                        <TableCell>
                          <p className="font-medium text-[var(--foreground)]">
                            {account.name || (account.mobile_number ? formatIndianMobileDisplay(account.mobile_number) : account.email)}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)]">{account.mobile_number}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {accountRoleNames.length > 0 ? (
                              accountRoleNames.map((role) => (
                                <Badge key={role} tone={role === "super_admin" ? "danger" : "neutral"}>
                                  {roleLabel(role)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-[var(--foreground-subtle)]">No roles assigned</span>
                            )}
                          </div>
                          {(account.managed_events ?? []).map((event) => (
                            <Link key={event.id} className="mt-1 block text-xs underline" href={`/ops/events/${event.id}`}>
                              {event.name}{!account.is_active ? " — needs manager reassignment" : ""}
                            </Link>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Badge tone={account.is_active ? "success" : "warning"}>
                            {account.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!account.is_event_manager && account.is_active && roles.global.some(role => role === "super_admin" || role === "operations_admin") && (
                            <Button size="sm" variant="ghost" loading={designate.isPending}
                              onClick={() => designate.mutate(account.id)}>Designate Event Manager</Button>
                          )}
                          {canToggle ? (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                loading={statusMutation.isPending}
                                onClick={() => {
                                  const action = account.is_active ? "Disable" : "Reactivate";
                                  if (window.confirm(`${action} ${account.name || account.email || account.mobile_number}? ${account.is_active ? "This blocks login, console and mobile staff access, including existing sessions." : "This restores access using their existing roles."}`)) {
                                    statusMutation.mutate({ userId: account.id, isActive: !account.is_active });
                                  }
                                }}
                              >
                                {account.is_active ? "Disable" : "Reactivate"}
                              </Button>
                            </div>
                          ) : (
                            <span className="block text-right text-xs text-[var(--foreground-subtle)]">Locked</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {accountPage && <Pagination page={page} totalPages={totalPages} totalItems={accountPage.total} onPageChange={setPage} />}

          {actionError && (
            <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--danger)]">{actionError}</div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
