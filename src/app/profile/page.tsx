"use client";

import UserProfile from "@/views/UserProfile";
import { useApp } from "@/context/AppContext";

export default function ProfileRoute() {
  const { user, refreshUser, setAuthToken, showToast } = useApp();

  return (
    <UserProfile
      user={user}
      onUpdateUser={refreshUser}
      onLogout={() => setAuthToken(null)}
      showToast={showToast}
    />
  );
}
