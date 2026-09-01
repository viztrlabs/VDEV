'use client';

import { useState } from 'react';
import { CollapsibleLeftFilterPanel } from '@/components/dashboard/CollapsibleLeftFilterPanel';
import { CollapsibleRightInspectorPanel } from '@/components/dashboard/CollapsibleRightInspectorPanel';

export default function CollapsibleRightPanel({ isOpen }: { isOpen: boolean }) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="right-panel">
      {open && (
        <>
          <CollapsibleLeftFilterPanel />
          <CollapsibleRightInspectorPanel />
        </>
      )}
    </div>
  );
}