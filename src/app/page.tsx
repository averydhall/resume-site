import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-black" />}>
      <HomeClient />
    </Suspense>
  );
}
