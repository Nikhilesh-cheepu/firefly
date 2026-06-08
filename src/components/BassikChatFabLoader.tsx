"use client";

import dynamic from "next/dynamic";

const BassikChatFab = dynamic(() => import("@/components/BassikChatFab").then((m) => m.BassikChatFab), {
  ssr: false,
});

export function BassikChatFabLoader() {
  return <BassikChatFab />;
}
