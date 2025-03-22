import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from 'fs';
import path from "path";
import ffmpeg  from 'fluent-ffmpeg';
import ffpath from '@ffmpeg-installer/ffmpeg';



const filePath = path.join(process.cwd(), '333.mp4');
ffmpeg.setFfmpegPath(ffpath.path)
ffmpeg(filePath)
.toFormat('mp3').on('end', function() {
    console.log('转换完成!');
  }).save("recording22.mp3")

// const openai = new OpenAI({
//     httpAgent:new HttpsProxyAgent("http://127.0.0.1:7890")
// });
// try {
//     const filePath = path.join(process.cwd(), 'recording.mp3');
//     const response = await openai.audio.transcriptions.create({
//         model: "whisper-1",
//         language: "zh",
//         file: fs.createReadStream(filePath),
//     });
//     const transcription = response.text;

//     console.log("Transcription: ", transcription);

// } catch (error) {
//     console.error("Error transcribing audio:", error);
// }
