type UserRole = 'admin' | 'gestor' | 'asistente';

export function getRole(user: { user_metadata?: { role?: string } } | null | undefined): UserRole {
  return (user?.user_metadata?.role as UserRole) ?? 'asistente';
}

export function canManageContent(role: UserRole): boolean {
  return role === 'admin' || role === 'gestor';
}

export function canDeleteScenario(role: UserRole): boolean {
  return role === 'admin';
}

export function canHardDeleteScenario(role: UserRole): boolean {
  return role === 'admin';
}

export function canUploadImages(role: UserRole): boolean {
  return role === 'admin';
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}
