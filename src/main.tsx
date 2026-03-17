import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecurity, performSecurityCheck } from "./lib/security-init.ts";

// Initialize security features before rendering app
initializeSecurity();

// Perform security check and log report
performSecurityCheck();

createRoot(document.getElementById("root")!).render(<App />);
