'use client';

import React, { createContext, useContext, useState } from 'react';

type UserRole = 'owner' | 'editor' | 'viewer';

type PermissionContextValue = {
  role: UserRole;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canManageMembers: boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

type PermissionProviderProps = {
  children: React.ReactNode;
  role?: UserRole;
};

export function PermissionProvider({ children, role = 'viewer' }: PermissionProviderProps) {
  const canEdit = role === 'owner' || role === 'editor';
  const canDelete = role === 'owner';
  const canCreate = role === 'owner' || role === 'editor';
  const canManageMembers = role === 'owner';

  return (
    <PermissionContext.Provider value={{ role, canEdit, canDelete, canCreate, canManageMembers }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    return {
      role: 'viewer' as UserRole,
      canEdit: false,
      canDelete: false,
      canCreate: false,
      canManageMembers: false,
    };
  }
  return context;
}
