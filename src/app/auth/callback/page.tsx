"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthToken } = useApp();

  useEffect(() => {
    const token = searchParams?.get("token");
    if (token) {
      setAuthToken(token);
    }
    const target = localStorage.getItem("redirect_target") || "/";
    localStorage.removeItem("redirect_target");
    let cleanTarget = target.startsWith("#/") ? target.replace("#/", "/") : target;
    
    // Safety check to prevent Open Redirect vulnerabilities
    if (!cleanTarget.startsWith("/") || cleanTarget.startsWith("//")) {
      cleanTarget = "/";
    }
    
    router.push(cleanTarget);
  }, [searchParams, router, setAuthToken]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
        <p className="text-xs font-bold text-slate-400">Autenticando sessão...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Carregando...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
