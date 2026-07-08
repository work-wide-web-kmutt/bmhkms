import { STAFF_ROLE_NAMES } from "../schemas/staff";

export function matchesStaffRole(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }

  const normalizedRoles = role
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  return normalizedRoles.some((value) =>
    STAFF_ROLE_NAMES.includes(value as (typeof STAFF_ROLE_NAMES)[number])
  );
}
