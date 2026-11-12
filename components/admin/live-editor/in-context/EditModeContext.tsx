'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface EditModeState {
  editMode: boolean;
  hoveredSectionId: string | null;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  drawerOpen: boolean;
}

export interface EditModeContextValue extends EditModeState {
  setEditMode: (value: boolean) => void;
  hoverSection: (sectionId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectField: (sectionId: string, fieldId: string) => void;
  closeDrawer: () => void;
}

export const EDIT_MODE_INITIAL_STATE: EditModeState = {
  editMode: true,
  hoveredSectionId: null,
  selectedSectionId: null,
  selectedFieldId: null,
  drawerOpen: false,
};

const OUTSIDE_PROVIDER: EditModeContextValue = {
  ...EDIT_MODE_INITIAL_STATE,
  editMode: false,
  setEditMode: () => {},
  hoverSection: () => {},
  selectSection: () => {},
  selectField: () => {},
  closeDrawer: () => {},
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: Partial<EditModeState>;
}) {
  const [state, setState] = useState<EditModeState>(() => ({
    ...EDIT_MODE_INITIAL_STATE,
    ...initial,
  }));

  const setEditMode = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, editMode: value }));
  }, []);

  const hoverSection = useCallback((sectionId: string | null) => {
    setState((prev) => (prev.hoveredSectionId === sectionId ? prev : { ...prev, hoveredSectionId: sectionId }));
  }, []);

  const selectSection = useCallback((sectionId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedSectionId: sectionId,
      selectedFieldId: null,
      drawerOpen: sectionId !== null,
    }));
  }, []);

  const selectField = useCallback((sectionId: string, fieldId: string) => {
    setState((prev) => ({
      ...prev,
      selectedSectionId: sectionId,
      selectedFieldId: fieldId,
      drawerOpen: true,
    }));
  }, []);

  const closeDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, drawerOpen: false, selectedFieldId: null }));
  }, []);

  const value = useMemo<EditModeContextValue>(
    () => ({
      ...state,
      setEditMode,
      hoverSection,
      selectSection,
      selectField,
      closeDrawer,
    }),
    [state, setEditMode, hoverSection, selectSection, selectField, closeDrawer],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode(): EditModeContextValue {
  return useContext(EditModeContext) ?? OUTSIDE_PROVIDER;
}
