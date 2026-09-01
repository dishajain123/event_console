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
  mobile_number: string;
  name: string | null;
  email: string | null;
  is_active: boolean;
}

export interface AccountRoleOut {
  role_name: RoleName;
  event_id: string | null;
  status: string;
}

export interface AccountOut {
  id: string;
  mobile_number: string;
  name: string | null;
  email: string | null;
  is_active: boolean;
  roles: AccountRoleOut[];
}

export interface AccountStatusUpdateIn {
  is_active: boolean;
}
