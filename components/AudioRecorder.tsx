"use client";
import { useRef, useState } from "react";
import { Microphone } from "@phosphor-icons/react";

import { transcribeAudio } from "../app/actions";

import Wave from "./Wave";

export enum MicrophoneStatus {
  Listening,
  stopListening,
}

interface AudioRecorderProps {
  onStatusChange?: (status: MicrophoneStatus) => void;
  onSubmit: (text: string) => void;
}
const mimeType =  "audio/mp4;";
export default function AudioRecorder({
  onStatusChange,
  onSubmit,
}: AudioRecorderProps) {
  let isRecording = false;
  const [play, setPlay] = useState(false);
  const SILENCE_THRESHOLD = 0.02; // 音量阈值 (0-1)
  const SILENCE_DURATION = 4000; // 静默持续时间 (毫秒)

  let audioChunks: Blob[] = [];
  let mediaRecorder = useRef<MediaRecorder>();
  let silenceStart = 0;

  let audioContext: AudioContext | null = null;
  let scriptProcessor: ScriptProcessorNode | null = null;

  const startRecording = async () => {
    try {
      // 初始化音频分析

      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("Microphone access granted");

      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      source.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      mediaRecorder.current = new MediaRecorder(stream,{mimeType});
      audioChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Received audio chunk:", event.data.size, "bytes");
          audioChunks.push(event.data);
        }
      };

      // 音频处理回调
      scriptProcessor.onaudioprocess = () => {
        const data = new Float32Array(analyser.fftSize);

        analyser.getFloatTimeDomainData(data);

        // 计算平均音量
        const volume =
          data.reduce((sum, val) => sum + Math.abs(val), 0) / data.length;

        if (volume < SILENCE_THRESHOLD && isRecording) {
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SILENCE_DURATION) {
            console.log("Silence detected, stopping recording...");
            stopRecording();
          }
        } else {
          silenceStart = 0;
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log("Recording stopped, processing audio...");
        const audioBlob = new Blob(audioChunks, { type:mimeType});

        console.log("Audio blob size:", audioBlob.size, "bytes");
        const form = new FormData();

        form.append("audio", audioBlob, "recording.mp4");
        const result = await transcribeAudio(form);

        console.log("Transcription complete:" + result);
        onStatusChange && onStatusChange(MicrophoneStatus.stopListening);
        onSubmit && onSubmit(result || "");
      };

      mediaRecorder.current.start(1000); // Collect data every second
      console.log("Started recording");
      onStatusChange && onStatusChange(MicrophoneStatus.Listening);
      setPlay(true);
      isRecording = true;
    } catch (error) {
      console.error("Error starting recording:", error);
      // this.onStatusChange('Error: ' + (error as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      console.log("Stopping recording...");
      mediaRecorder.current.stop();
      scriptProcessor?.disconnect();
      audioContext?.close();
      setPlay(false);
      isRecording = false;
      onStatusChange && onStatusChange(MicrophoneStatus.stopListening);

      // Stop all tracks in the stream
      const stream = mediaRecorder.current.stream;

      stream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <button
      className="w-full p-1 flex flex-row justify-center bg-default-100 items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md bg-background/10 backdrop-blur backdrop-saturate-150"
      onClick={()=>play?startRecording():stopRecording()}
    >
      <Microphone color={play ? "#1f94ea" : "white"} fontSize={28} />
      <Wave play={play} />
    </button>
  );
}
