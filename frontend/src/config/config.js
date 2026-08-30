// export const BACKEND_HOST = "172.20.10.6";

// export const BACKEND_PORT = "8080";

// export const  WS_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/ws`;
// export const API_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/api`;



export const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
export const WS_URL = import.meta.env.VITE_WS_URL || `${window.location.origin}/ws`;

// BASE_URL is the root backend URL (stripped of /api) to load dynamic media files
export const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : `${window.location.origin}`;