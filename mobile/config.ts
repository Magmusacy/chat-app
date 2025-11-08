const DEV_API_URL = "http://192.168.0.101:8080";
const PROD_API_URL = "https://chat-app-wpnvc.ondigitalocean.app";

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const defaultImage = require("./assets/images/defaultpfp.png");
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 4;
export const MAX_NAME_LENGTH = 20;
