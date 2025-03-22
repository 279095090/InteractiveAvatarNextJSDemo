import { useRef, useState } from "react";
import { transcribeAudio } from "../app/actions";

export default function Demo() {
    const mediaRecorder = useRef<MediaRecorder>();
    const [url, seturl] = useState("");
    const [text, setText] = useState("");
    const start = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(audioStream, { mimeType: 'audio/mp4' });
            let chunks: BlobPart[] = [];

            mediaRecorder.current.ondataavailable = (event) => {
                chunks.push(event.data);
                console.log('add some data' + event.data.size);
            };

            mediaRecorder.current.onstop = () => {
                try {
                    const blob = new Blob(chunks, { type: 'audio/mp4' });
                    chunks = [];
                    seturl(URL.createObjectURL(blob));

                    const form = new FormData();

                    form.append("audio", blob, "recording.mp4");
                    transcribeAudio(form).then((result) => {
                        setText(result || '')
                    })

                } catch (error) {
                    console.error("Error creating audio blob:", error);
                }

            };

            mediaRecorder.current.start();
            console.log("Recording started.");
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    }
    const stop = (() => {
        mediaRecorder?.current?.stop();
    })
    return <div>
        <button id="recordButton" onClick={start}>开始录制</button>
        <button id="recordButton" onClick={stop}>停止录制</button>
        <div>{text}</div>
        <audio id="audioRecorded" src={url} controls></audio>
    </div>
}