"use client";

import { AccountManagementPage } from "@/components/accounts/account-management-page";

/** Operations-scoped account creation: Event Manager and Operations Admin
 * only. Finance staff (Finance Admin/Operator/Auditor) are created from
 * the separate Finance Accounts page — see finance/accounts/page.tsx.
 * Volunteers aren't an RBAC role at all (they apply via the mobile app
 * and are reviewed under Ops → People & Staffing → Volunteers), so they
 * don't appear in this role-provisioning list. */
export default function AdminAccountsPage() {
  return (
    <AccountManagementPage
      title="Admin Accounts"
      roleScope={["operations_admin", "event_manager"]}
    />
  );
}
