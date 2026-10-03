export const ADMIN_ROLE = "admin" as const;
export const MANAGER_ROLE = "manager" as const;

export const STAFF_ROLES = [ADMIN_ROLE, MANAGER_ROLE] as const;

export type AdminRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role?: string): role is AdminRole {
  return role === ADMIN_ROLE || role === MANAGER_ROLE;
}

export function isManagerRole(role?: string): boolean {
  return role === MANAGER_ROLE;
}
