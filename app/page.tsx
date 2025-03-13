"use client";
import InteractiveAvatarUseAssistantTwo from "@/components/InteractiveAvatarUseAssistantTwo";
import Demo from "@/components/Demo";

export default function App() {
  return (
    <div className="w-screen h-[calc(100dvh)] flex flex-col">
      <div className="w-screen h-[calc(100dvh)] flex flex-col items-start justify-start gap-5">
        {/* <InteractiveAvatarUseAssistantTwo /> */}
        <Demo></Demo>
      </div>
    </div>
  );
}
