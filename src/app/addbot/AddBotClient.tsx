"use client";

import AddBotPage from "@/views/AddBotPage";
import { useApp } from "@/context/AppContext";

export default function AddBotClient() {
  const { user, refreshUser, showToast } = useApp();

  return <AddBotPage user={user} onUpdateUser={refreshUser} showToast={showToast} />;
}
