import { Message } from "ai/react";
import { useEffect, useRef } from "react";
interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const view = useRef<HTMLDivElement>(null);

  useEffect(() => {
    view.current!.scrollIntoView(false);
  }, [messages]);

  return (
    <div ref={view} className="w-full border-none flex flex-col gap-1">
      {messages.reverse().map((message: Message) => (
        <div key={message.id} className="flex flex-row ">
          {/* <span className="w-16 after:content-[':']">{message.role}</span> */}
          <span className="flex-1 backdrop-blur-sm bg-white/20 rounded-md text-sm p-1">
            {message.content}
          </span>
        </div>
      ))}
    </div>
  );
}
