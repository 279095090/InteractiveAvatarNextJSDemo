// import { AssistantResponse } from 'ai';
import { streamText } from 'ai';
import OpenAI from 'openai';
import HttpsProxyAgent from 'https-proxy-agent';
// import { openai } from '@ai-sdk/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  httpAgent:process.env.HTTP_PROXY ?new HttpsProxyAgent.HttpsProxyAgent(process.env.HTTP_PROXY):''
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log(messages);
  try {
    var result =await openai.chat.completions.create({messages,model:'gpt-4-turbo'});

    // const result = await streamText({
    //   model: openai("gpt-4-turbo"),
    //   messages,
    // });
    
    // return result.toAIStreamResponse();
    // return result.asResponse();
    console.log(result);
    return Response.json({message:result.choices[0].message});
  } catch (err) {
    console.log(err);
  }
}
