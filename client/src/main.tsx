import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeData } from "@/lib/utils";

// Initialize the app immediately
initializeData().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
