const DEV_API_URL = "http://10.0.2.2:8080";
const PROD_API_URL = "https://your-production-url.com";

export const API_URL =
  process.env.NODE_ENV === "production" ? PROD_API_URL : DEV_API_URL;
