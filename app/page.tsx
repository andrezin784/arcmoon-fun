'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-pulse">🌙</div>
        <p className="text-gray-400 mt-4">Carregando Moon.fun...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <HomeContent />;
}

