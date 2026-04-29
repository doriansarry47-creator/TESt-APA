import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL for production (Vercel serverless) vs. dev (local Express)
// In production on Vercel, the API is served from the same origin via serverless functions.
// In development, the frontend dev server proxies /api to the Express server.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
setBaseUrl(apiBaseUrl || null);

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found in the DOM");
}

createRoot(rootEl).render(<App />);
