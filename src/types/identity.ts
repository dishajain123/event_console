/** Mirrors app/modules/identity/schemas.py exactly. */
import type { RoleName } from "@/types/rbac";

export interface OTPRequestOut {
  message: string;
  resend_available_in_seconds: number;
}

export interface TokenPairOut {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface UserOut {
  id: string;
  mobile_number: string | null;
  name: string | null;
  email: string | null;
  email_verified_at?: string | null;
  is_active: boolean;
  status?: "ACTIVE" | "DISABLED";
}

export interface AccountRoleOut {
  role_name: RoleName;
  event_id: string | null;
  status: string;
}

export interface AccountOut {
  id: string;
  mobile_number: string | null;
  name: string | null;
  email: string | null;
  is_active: boolean;
  status?: "ACTIVE" | "DISABLED";
  is_event_manager: boolean;
  can_manage_status: boolean;
  managed_events: { id: string; name: string }[];
  roles: AccountRoleOut[];
}

export interface AccountStatusUpdateIn {
  is_active: boolean;
  status?: "ACTIVE" | "DISABLED";
}
