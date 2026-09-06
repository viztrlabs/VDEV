'use client';

import { useEffect } from 'react';

interface EditorClientProps {
  config: Record<string, any>;
}

export default function EditorClient({ config }: EditorClientProps) {
  useEffect(() => {
    (window as any).config = config;
  }, [config]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#1a1a2e' }}>
      <div id="app" style={{ width: '100%', height: '100%' }} />
      <link rel="stylesheet" href="http://localhost:3487/css/editor.css" />
      <script type="module" src="http://localhost:3487/js/editor.js" />
    </div>
  );
}