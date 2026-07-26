"use client";

import { use } from "react";
import PublicUserProfile from "@/views/PublicUserProfile";
import { useApp } from "@/context/AppContext";

export default function UserProfileClient({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const { user, showToast, showCelebration, recaptchaSiteKey } = useApp();

  return (
    <PublicUserProfile
      userId={userId}
      currentUser={user}
      showToast={showToast}
      showCelebration={showCelebration}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
}
