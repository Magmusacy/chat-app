const DEV_API_URL = "http://192.168.8.175:8080";
const PROD_API_URL = "https://chatapp-backend-5eez.onrender.com";

export const API_URL =
  // process.env.NODE_ENV === "production" ? PROD_API_URL : DEV_API_URL;
  DEV_API_URL;
