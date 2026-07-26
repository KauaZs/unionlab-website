"use client";

import VipPage from "@/views/VipPage";
import { useApp } from "@/context/AppContext";

export default function VipClient() {
  const { user, refreshUser, showToast } = useApp();

  return <VipPage user={user} onUpdateUser={refreshUser} showToast={showToast} />;
}
