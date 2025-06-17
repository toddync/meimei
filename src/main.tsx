import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { flowerLotus } from "@lucide/lab";
import { Icon } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import DotsMenu from "./lib/components/dots-menu";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="h-8 bg-accent border-b flex">
      <div className="w-12 flex">
        <div className="mx-auto text-sidebar-primary flex aspect-square size-8 items-center justify-center">
          <Icon iconNode={flowerLotus} className="size-5 stroke-2" />
        </div>
      </div>
      <DotsMenu />
    </div>
    <App />
  </React.StrictMode>,
);
