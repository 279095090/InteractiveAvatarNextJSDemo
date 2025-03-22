import { useRef, useState } from "react";
import { Microphone } from "@phosphor-icons/react";

import Wave from "./Wave";

export enum MicrophoneStatus {
  Listening,
  stopListening,
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
}

const SpeechRecognition =
  globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange,
}: MicrophoneInputProps) {
  const firstflag = useRef(true);
  let recognition = useRef<SpeechRecognition>();

  const [play, setPlay] = useState<boolean>(false);
  const handlerStop = () => {
    setPlay(false);
    onStopPlay && onStopPlay();
  };

  /**
   * 
   * language:
   * zh-HK 华 - 香港的 SAR
   * 
   * zh-MO 华 - 澳门的 SAR
   * zh-CN 华 -中国
   * zh-CHS 华 (单一化)
   * zh-SG 华 -新加坡
   * zh-TW 华 -台湾
   * us en-US 英语
   * @returns 
   */
  const startPlay = () => {
    if (play) return;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.lang = "zh-hk";
    recognition.current.interimResults = true;
    recognition.current.maxAlternatives = 1;
    recognition.current.onresult = function (event) {
      const item = event.results[0];

      console.info(
        "Result received: " + item[0].transcript + " ." + item[0].confidence,
      );
      contentChange && contentChange(item[0].transcript);
      if (item.isFinal) {
        recognition.current?.stop();
        onSubmit && onSubmit(item[0].transcript);
      }
    };
    recognition.current.onstart = function () {
      console.log("start");
      onStatusChange && onStatusChange(MicrophoneStatus.Listening);
    };
    recognition.current.onend = function () {
      setPlay(false);
      console.log("end");
      onStatusChange && onStatusChange(MicrophoneStatus.stopListening);
    };
    recognition.current.onspeechend = function () {
      recognition.current!.stop();
    };

    recognition.current.onerror = function (event) {
      console.error("Error occurred in recognition: " + event.error);
    };
    recognition.current.start();
    setPlay(true);
  };

  return (
    <button
      className="w-full p-1 flex flex-row justify-center bg-default-100 items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md bg-background/10 backdrop-blur backdrop-saturate-150"
      onClick={startPlay}
    >
      <Microphone color={play ? "#1f94ea" : "white"} fontSize={28} />
      <Wave play={play} />
    </button>
  );
}
