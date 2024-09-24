import OpenAI from "openai";
import { AssistantResponse } from "ai";
import { HttpsProxyAgent } from "https-proxy-agent";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  organization: "org-m6eQDPtdps1E69GKBEqdtOMl",
  project: "proj_g8UWLm4RvwfpK5jKkj0CGt5z",
  httpAgent: process.env.HTTP_PROXY
    ? new HttpsProxyAgent(process.env.HTTP_PROXY)
    : "",
});
const threadId = "thread_sfA5cNxkABXZmgvcL6AYjoVQ";

export async function POST(req: Request) {
  const input: {
    // threadId: string | null;
    message: string;
  } = await req.json();

  //   const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
  console.log(input.message);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.ASSISTANT_ID ??
          (() => {
            throw new Error("ASSISTANT_ID environment is not set");
          })(),
      });

      await forwardStream(runStream);
    },
  );
}
