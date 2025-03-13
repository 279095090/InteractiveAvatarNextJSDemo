'use client'
import { transcribeAudio } from '../app/actions'
import { useRef, useState } from "react";

export enum MicrophoneStatus {
    Listening,
    stopListening
}

interface AudioRecorderProps {
    onStatusChange?: (status: MicrophoneStatus) => void;
    onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorder({ onStatusChange, onTranscriptionComplete }: AudioRecorderProps) {
    const [isRecording, setRecording] = useState(false);
    const SILENCE_THRESHOLD = 0.02; // 音量阈值 (0-1)
    const SILENCE_DURATION = 2000;  // 静默持续时间 (毫秒)

    let audioChunks: Blob[] = [];
    let mediaRecorder = useRef<MediaRecorder>();
    let silenceStart = 0;

    let audioContext:AudioContext|null=null;
    let scriptProcessor:ScriptProcessorNode|null=null;

    const startRecording = async () => {
        try {
            // 初始化音频分析

            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');

            audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

            source.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks = []
            setRecording(true);

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log('Received audio chunk:', event.data.size, 'bytes');
                    audioChunks.push(event.data);
                }
            };

            // 音频处理回调
            scriptProcessor.onaudioprocess = () => {
                const data = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(data);

                // 计算平均音量
                const volume = data.reduce((sum, val) => sum + Math.abs(val), 0) / data.length;

                if (volume < SILENCE_THRESHOLD) {
                    if (!silenceStart) silenceStart = Date.now();
                    if (Date.now() - silenceStart > SILENCE_DURATION) {
                        console.log('Silence detected, stopping recording...');
                        stopRecording();
                    }
                } else {
                    silenceStart = 0;
                }
            };

            mediaRecorder.current.onstop = async () => {
                console.log('Recording stopped, processing audio...');
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                console.log('Audio blob size:', audioBlob.size, 'bytes');
                const form = new FormData();
                form.append('audio', audioBlob, 'recording.webm');
                const text = await transcribeAudio(form);
                onStatusChange && onStatusChange(MicrophoneStatus.stopListening);
                onTranscriptionComplete && onTranscriptionComplete(text || '');
            };

            mediaRecorder.current.start(1000); // Collect data every second
            console.log('Started recording');
            onStatusChange && onStatusChange(MicrophoneStatus.Listening);
        } catch (error) {
            console.error('Error starting recording:', error);
            // this.onStatusChange('Error: ' + (error as Error).message);
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            console.log('Stopping recording...');
            mediaRecorder.current.stop();
            scriptProcessor?.disconnect();
            audioContext?.close();
            setRecording(false);
            onStatusChange && onStatusChange(MicrophoneStatus.stopListening);

            // Stop all tracks in the stream
            const stream = mediaRecorder.current.stream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

    return (
        <div>
            <button onClick={() => { isRecording ? stopRecording() : startRecording() }}>{isRecording ? "Stop" : "Start"}</button>
        </div>
    )
}