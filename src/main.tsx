import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {ClerkProvider} from "@clerk/clerk-react";
import { StrictMode } from "react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if(!PUBLISHABLE_KEY) {
    throw new Error("Add clerk publishable key to .env file");
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
        </ClerkProvider>
    </StrictMode>
);
