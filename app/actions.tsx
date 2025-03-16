"use server";
import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from 'fs';
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  httpAgent: process.env.HTTP_PROXY
    ? new HttpsProxyAgent(process.env.HTTP_PROXY)
    : "",
});

export async function transcribeAudio(data: FormData) {
  try {
    // Convert Blob to File
    const audioFile = data.get("audio") as File;
    // const audioFile = new File([audioBlob], "audio.webm", {
    //   type: "audio/webm",
    // });
    const bts = await audioFile.arrayBuffer()
    // const filePath = path.join(process.cwd(), audioFile.name);
    // fs.writeFileSync(filePath,new Uint8Array(bts));
    // console.log(`save file to ${filePath}`)
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      language: "zh",
      file: audioFile,
    });
    const transcription = response.text;

    console.log("Transcription: ", transcription);

    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
  }
}
