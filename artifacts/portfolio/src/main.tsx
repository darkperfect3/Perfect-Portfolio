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

// Preload Clerk JS from a known CDN if not already provided by the runtime.
// This prevents the Clerk loader from attempting to fetch a malformed URL.
const clerkScriptUrl = "https://unpkg.com/@clerk/clerk-js@6/dist/clerk.browser.js";
if (typeof document !== "undefined") {
	const existing = document.querySelector(`script[src="${clerkScriptUrl}"]`);
	if (!existing) {
		const s = document.createElement("script");
		s.src = clerkScriptUrl;
		s.async = true;
		s.crossOrigin = "anonymous";
		document.head.appendChild(s);
	}
}

if (typeof document !== "undefined") {
  document.body.style.visibility = "visible";
}

createRoot(document.getElementById("root")!).render(<App />);
