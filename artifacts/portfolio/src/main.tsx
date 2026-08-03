import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Configure API base for the generated client. In production set
// `VITE_API_BASE` in your Netlify environment to the Render backend URL
// (for example: https://perfect-portfolio.onrender.com).
const apiBase = (
  import.meta.env.VITE_API_BASE ?? import.meta.env.NEXT_PUBLIC_API_BASE
)?.trim();
setBaseUrl(apiBase && apiBase !== "" ? apiBase : null);

if (typeof document !== "undefined") {
  document.body.style.visibility = "visible";
}

createRoot(document.getElementById("root")!).render(<App />);
