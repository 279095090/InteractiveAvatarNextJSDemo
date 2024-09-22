const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';

const proxyUrl = 'http://127.0.0.1:7890';
// Replace <proxy_url> with your actual proxy URL
const agent = new HttpsProxyAgent.HttpsProxyAgent(proxyUrl);

// Use fetch with the agent option to make an HTTP request through the proxy
// Replace <target_url> with the URL you want to request
// fetch('https://google.com', { agent })
//   .then((response) => response.text())
//   .then((text) => console.log(text))
//   .catch((error) => console.error(error));

async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const agent = new HttpsProxyAgent.HttpsProxyAgent(proxyUrl);

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
        agent
      }
    );
    const data = await res.json();
    // console.log(data.data)
    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}

POST().then(rps=>console.log(rps))