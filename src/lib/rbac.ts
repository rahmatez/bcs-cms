import { Role } from "@prisma/client";

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [
    Role.SUPER_ADMIN,
    Role.CONTENT_ADMIN,
    Role.MATCH_ADMIN,
    Role.MERCH_ADMIN,
    Role.FINANCE,
    Role.MODERATOR,
    Role.USER
  ],
  [Role.CONTENT_ADMIN]: [Role.CONTENT_ADMIN, Role.USER],
  [Role.MATCH_ADMIN]: [Role.MATCH_ADMIN, Role.USER],
  [Role.MERCH_ADMIN]: [Role.MERCH_ADMIN, Role.USER],
  [Role.FINANCE]: [Role.FINANCE, Role.USER],
  [Role.MODERATOR]: [Role.MODERATOR, Role.USER],
  [Role.USER]: [Role.USER]
};

export function canAccess(required: Role[], currentRole: Role | null | undefined) {
  if (!currentRole) return false;
  const accessibleRoles = ROLE_HIERARCHY[currentRole];
  return required.some((role) => accessibleRoles.includes(role));
}

export function requireRole(required: Role[], currentRole: Role | null | undefined) {
  if (!canAccess(required, currentRole)) {
    throw new Error("Unauthorized");
  }
}
