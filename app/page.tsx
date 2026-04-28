"use client";

import dynamic from "next/dynamic";

const CounterApp = dynamic(() => import("@/components/CounterApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-neutral-400 animate-pulse">Loading App...</div>
    </div>
  ),
});

export default function Home() {
  return <CounterApp />;
}
