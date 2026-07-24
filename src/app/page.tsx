"use client";

import dynamic from "next/dynamic";

// Three.js can only run in the browser — skip SSR for the canvas.
const Scene = dynamic(() => import("@/scene/Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#060a14] text-zinc-400">
      Loading stadium…
    </div>
  ),
});

export default function Home() {
  return <Scene />;
}
