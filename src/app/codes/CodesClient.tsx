"use client";

import CodesPage from "@/views/CodesPage";
import { useApp } from "@/context/AppContext";

export default function CodesClient() {
  const { user, refreshUser, showToast } = useApp();

  return <CodesPage user={user} refreshUser={refreshUser} showToast={showToast} />;
}
