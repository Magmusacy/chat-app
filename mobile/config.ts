const DEV_API_URL = "http://192.168.0.103:8080";
const PROD_API_URL = "https://chatapp-backend-5eez.onrender.com";

export const API_URL =
  // process.env.NODE_ENV === "production" ? PROD_API_URL : DEV_API_URL;
  DEV_API_URL;

export const defaultImage = require("./assets/images/defaultpfp.png");
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 4;
export const MAX_NAME_LENGTH = 20;
