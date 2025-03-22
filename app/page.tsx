"use client";
import AudioRecorder from "@/components/AudioRecorder";
import InteractiveAvatarUseAssistantTwo from "@/components/InteractiveAvatarUseAssistantTwo";
import MicrophoneInput from "@/components/MicrophoneInput";
import { useState } from "react";

export default function App() {
  const [text, setInput] = useState("");
  const [talking, setTalking] = useState(false);

  return (
    <div className="w-screen h-[calc(100dvh)] flex flex-col">
      <div className="w-screen h-[calc(100dvh)] flex flex-col items-start justify-start gap-5">
        {/* <InteractiveAvatarUseAssistantTwo /> */}

        {/* <AudioRecorder onSubmit={(text) => console.log(text)} />         */}        
         <MicrophoneInput
               contentChange={(content) => {
            setInput(content);
          }}
          talking={talking}
        />
        <div>{text}</div>
      </div>
    </div>
  );
}
