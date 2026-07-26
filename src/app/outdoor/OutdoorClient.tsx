"use client";

import OutdoorPage from "@/views/OutdoorPage";
import { useApp } from "@/context/AppContext";

export default function OutdoorClient() {
  const { user, refreshUser, showToast } = useApp();

  return <OutdoorPage user={user} onUpdateUser={refreshUser} showToast={showToast} />;
}
