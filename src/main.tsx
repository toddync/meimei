import { Toaster } from "@/components/ui/sonner";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import Menubar from "./lib/components/menubar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Toaster richColors theme="dark" position="bottom-center" />
    <Menubar />
    <div className="relative pt-8">
      <App />
    </div>
  </React.StrictMode>,
);
