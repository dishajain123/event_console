export const INDIA_DIAL_CODE = "+91";

export function sanitizeIndianMobileInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length > 10) {
    return digits.slice(-10);
  }
  if (digits.startsWith("0") && digits.length > 10) {
    return digits.slice(-10);
  }
  return digits.slice(0, 10);
}

export function normalizeIndianMobileNumber(value: string): string {
  const digits = sanitizeIndianMobileInput(value);
  if (digits.length !== 10) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }
  return `${INDIA_DIAL_CODE}${digits}`;
}

export function formatIndianMobileDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.length >= 12 && digits.startsWith("91") ? digits.slice(-10) : digits.slice(-10);
  if (local.length !== 10) return value;
  return `${INDIA_DIAL_CODE} ${local.slice(0, 5)} ${local.slice(5)}`;
}
