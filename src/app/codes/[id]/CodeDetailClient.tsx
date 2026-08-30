"use client";

import React, { use } from "react";
import CodeDetailPage from "@/views/CodeDetailPage";
import { useApp } from "@/context/AppContext";

interface CodeDetailClientProps {
  params: Promise<{ id: string }>;
}

export default function CodeDetailClient({ params }: CodeDetailClientProps) {
  const { id } = use(params);
  const { user, refreshUser, showToast } = useApp();

  return <CodeDetailPage id={id} user={user} refreshUser={refreshUser} showToast={showToast} />;
}
