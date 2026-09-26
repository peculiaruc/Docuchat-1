import axios, { AxiosInstance } from "axios";

export const openaiClient: AxiosInstance = axios.create({
  baseURL: "https://api.openai.com/v1",
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "Document/1.0",
  },
});

openaiClient.interceptors.request.use((config) => {
  (config as { startTime?: number }).startTime = Date.now();
  console.log(`[OpenAI] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

openaiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as { startTime?: number }).startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    console.log(
      `OpenAI ${response.status} ${response.config.url} (${duration}ms)`
    );

    const remaining = parseInt(
        response.headers['x-ratelimit-remaining-requests'] || '999'
      );
    
      if (remaining < 50) {
        console.warn(`OpenAI rate limit getting low: ${remaining} remaining`);
      }

      
    return response;
  },
  (error) => {
    const startTime = error.config?.startTime as number | undefined;
    const duration = startTime ? Date.now() - startTime : 0;

    if (error.response) {
      console.error(
        `OpenAI ${error.response.status} ${error.config?.url} (${duration}ms):`,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        `OpenAI no response ${error.config?.url} (${duration}ms):`,
        error.message
      );
    } else {
      console.error("OpenAI request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);
