import React from "react";
import { createRoot } from "react-dom/client";
import WalletInterface from "./WalletInterface";

(function mountWalletOverlay() {
  const id = "wallet-overlay-anchor";
  if (document.getElementById(id)) return;
  const el = document.createElement("div");
  el.id = id;
  el.style.position = "fixed";
  el.style.right = "16px";
  el.style.bottom = "16px";
  el.style.zIndex = "2147483647";
  el.style.maxWidth = "420px";
  el.style.width = "calc(100vw - 32px)";
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(<WalletInterface />);
})();
