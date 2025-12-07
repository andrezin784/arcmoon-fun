'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse">🌙</div>
          <p className="text-gray-400 mt-4">Carregando Moon.fun...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

