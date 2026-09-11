"use client";

import { AccountManagementPage } from "@/components/accounts/account-management-page";

/** Finance-scoped account creation: Finance Admin, Finance Operator, and
 * Finance Auditor only. Operations staff (Event Manager/Operations Admin)
 * are created from the Ops "Admin Accounts" page instead — see
 * ops/admin-accounts/page.tsx. */
export default function FinanceAccountsPage() {
  return (
    <AccountManagementPage
      title="Finance Accounts"
      roleScope={["finance_admin", "finance_operator", "finance_auditor"]}
    />
  );
}
