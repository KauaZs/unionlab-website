"use client";

import { use } from "react";
import RacePage from "@/views/RacePage";
import { useApp } from "@/context/AppContext";

export default function RaceRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id: raceId } = use(params);
  const { user, refreshUser, showToast } = useApp();

  return (
    <RacePage
      raceId={raceId}
      user={user}
      onUpdateUser={refreshUser}
      showToast={showToast}
    />
  );
}
