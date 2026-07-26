"use client";

import BannerStore from "@/views/BannerStore";
import { useApp } from "@/context/AppContext";

export default function StoreRoute() {
  const { user, refreshUser } = useApp();

  return <BannerStore user={user} onUpdateUser={refreshUser} />;
}
