"use client";

import InteractiveAvatar from "@/components/InteractiveAvatarUseAssistant";
import InteractiveAvatarCode from "@/components/InteractiveAvatarCode";
import { Tab, Tabs } from "@nextui-org/react";
import ChatMessageDemo from "@/components/ChatMessageDemo";
import InteractiveAvatarUseAssistantTwo from "@/components/InteractiveAvatarUseAssistantTwo";
import MicrophoneInput from "@/components/MicrophoneInput";

export default function App() {
  const tabs = [
    {
      id: "Two",
      label: "Two",
      content: <InteractiveAvatarUseAssistantTwo />,
    },
    {
      id: "test",
      label: "test",
      content: <ChatMessageDemo />,
    },
    {
      id: "demo",
      label: "Demo",
      content: <InteractiveAvatar />,
    },
    // {
    //   id: "code",
    //   label: "Code",
    //   content: <InteractiveAvatarCode />,
    // },
  ];

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="w-screen flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        {/* <div className="w-full">
          <Tabs items={tabs}>
            {(items) => (
              <Tab key={items.id} title={items.label}>
                {items.content}
              </Tab>
            )}
          </Tabs>
        </div> */}
        <InteractiveAvatarUseAssistantTwo />
        {/* <MicrophoneInput /> */}



      </div>
    </div>
  );
}
